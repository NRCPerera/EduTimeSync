from flask import Flask, request, jsonify
from pymongo import MongoClient
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from bson.objectid import ObjectId
from pytz import UTC

app = Flask(__name__)
load_dotenv()

mongo_uri = os.getenv('MONGO_URI')
client = MongoClient(mongo_uri)
db = client.get_default_database()

def parse_time_slot(slot, date):
    start_str, end_str = slot.split('-')
    start_hour, start_min, start_period = start_str.split(':')[0].strip(), start_str.split(':')[1][:2].strip(), start_str[-2:].strip()
    end_hour, end_min, end_period = end_str.split(':')[0].strip(), end_str.split(':')[1][:2].strip(), end_str[-2:].strip()

    start_hour = int(start_hour)
    end_hour = int(end_hour)
    if start_period == 'PM' and start_hour != 12:
        start_hour += 12
    if start_period == 'AM' and start_hour == 12:
        start_hour = 0
    if end_period == 'PM' and end_hour != 12:
        end_hour += 12
    if end_period == 'AM' and end_hour == 12:
        end_hour = 0

    start_time = UTC.localize(datetime.combine(date, datetime.min.time()).replace(hour=start_hour, minute=int(start_min)))
    end_time = UTC.localize(datetime.combine(date, datetime.min.time()).replace(hour=end_hour, minute=int(end_min)))
    return start_time, end_time

def parse_proposed_time(proposed_time):
    date = datetime.fromisoformat(proposed_time['date'].replace('Z', '+00:00')).date()
    start_time = datetime.strptime(proposed_time['startTime'], '%H:%M').time()
    end_time = datetime.strptime(proposed_time['endTime'], '%H:%M').time()
    start_datetime = UTC.localize(datetime.combine(date, start_time))
    end_datetime = UTC.localize(datetime.combine(date, end_time))
    return start_datetime, end_datetime

def has_conflict(new_start, new_end, existing_schedules, examiner_id, student_id, exclude_schedule_id=None):
    for schedule in existing_schedules:
        if exclude_schedule_id and str(schedule['_id']) == str(exclude_schedule_id):
            continue
        start_str = schedule['startTime']
        end_str = schedule['endTime']
        
        if isinstance(start_str, datetime):
            s_start = start_str if start_str.tzinfo else UTC.localize(start_str)
            s_end = end_str if end_str.tzinfo else UTC.localize(end_str)
        else:
            s_start = datetime.fromisoformat(start_str.replace('Z', '+00:00'))
            s_end = datetime.fromisoformat(end_str.replace('Z', '+00:00'))

        examiner_conflict = str(schedule['examinerId']) == str(examiner_id)
        student_conflict = str(schedule['studentId']) == str(student_id)
        time_conflict = new_start < s_end and new_end > s_start
        if (examiner_conflict or student_conflict) and time_conflict:
            return True
    return False

@app.route('/schedule', methods=['POST'])
def create_schedules():
    data = request.get_json()
    start_date = datetime.fromisoformat(data['startDate'].replace('Z', '+00:00'))
    end_date = datetime.fromisoformat(data['endDate'].replace('Z', '+00:00'))
    duration = data['duration']
    module = data['module']
    examiner_ids = data['examinerIds']
    event_id = data.get('eventId')

    print('Received examiner IDs:', examiner_ids)
    print('Received module:', module)
    print('Start Date:', start_date)
    print('End Date:', end_date)
    print('Duration:', duration)
    print('Event ID:', event_id)

    registrations = list(db.moduleregistrations.find({'moduleCode': module}))
    print('Registrations in Python:', registrations)
    student_ids = [str(reg['studentId']) for reg in registrations]
    if not student_ids:
        print('No student IDs found for module:', module)
        return jsonify({'error': 'No students registered for this module'}), 400

    examiner_ids_obj = [ObjectId(id) for id in examiner_ids]
    availabilities = list(db.examineravailabilities.find({'examinerId': {'$in': examiner_ids_obj}, 'module': module}))
    print('Examiner availabilities:', availabilities)

    slots_by_examiner = {}
    for avail in availabilities:
        examiner_id = str(avail['examinerId'])
        date = avail['date']
        print(f'Processing availability for {examiner_id} on {date}')
        if start_date.date() <= date.date() <= end_date.date():
            slots = []
            for slot in avail['availableSlots']:
                start_time, end_time = parse_time_slot(slot, date)
                print(f'Slot: {slot} -> {start_time} to {end_time}')
                if start_date <= start_time and end_time <= end_date:
                    slots.append({'startTime': start_time, 'endTime': end_time})
                else:
                    print(f'Slot {slot} filtered out: outside event range')
            slots_by_examiner[examiner_id] = slots

    print('Slots by examiner:', slots_by_examiner)
    if not any(slots_by_examiner.values()):
        print('No valid slots after filtering')
        return jsonify({'error': 'No examiner availability within event dates'}), 400

    existing_schedules = list(db.schedules.find({'$or': [
        {'examinerId': {'$in': examiner_ids_obj}},
        {'studentId': {'$in': student_ids}}
    ]}))
    print('Existing schedules:', existing_schedules)

    schedules = []
    available_examiners = list(slots_by_examiner.keys())
    if not available_examiners:
        return jsonify({'error': 'No examiners with available slots'}), 400

    examiner_index = 0
    for student_id in student_ids:
        examiner_id = available_examiners[examiner_index % len(available_examiners)]
        avail_slots = slots_by_examiner[examiner_id]
        print(f'Scheduling for student {student_id} with examiner {examiner_id}')

        scheduled = False
        for slot in avail_slots:
            current_start = slot['startTime']
            while current_start + timedelta(minutes=duration) <= slot['endTime']:
                current_end = current_start + timedelta(minutes=duration)
                print(f'Trying {current_start} to {current_end}')
                if not has_conflict(current_start, current_end, existing_schedules + schedules, examiner_id, student_id):
                    schedule = {
                        'examinerId': examiner_id,
                        'studentId': student_id,
                        'startTime': current_start.isoformat(),
                        'endTime': current_end.isoformat(),
                        'googleMeetLink': f'https://meet.google.com/event-{len(schedules) + 1}',
                        'module': module,
                    }
                    if event_id:
                        schedule['eventId'] = event_id
                    schedules.append(schedule)
                    scheduled = True
                    break
                current_start += timedelta(minutes=duration)
            if scheduled:
                break

        if not scheduled:
            print(f'Failed to schedule student {student_id}')
            return jsonify({'error': f'No conflict-free slot for student {student_id}'}), 400
        examiner_index += 1

    print('Generated schedules:', schedules)
    return jsonify({'schedules': schedules}), 200

@app.route('/reschedule/<schedule_id>', methods=['PUT'])
def reschedule_exam(schedule_id):
    data = request.get_json()
    proposed_time = data.get('proposedTime')
    examiner_id = data.get('examinerId')
    student_id = data.get('studentId')

    if not all([proposed_time, examiner_id, student_id]):
        return jsonify({'error': 'Missing required fields: proposedTime, examinerId, studentId'}), 400

    try:
        schedule = db.schedules.find_one({'_id': ObjectId(schedule_id)})
        if not schedule:
            return jsonify({'error': 'Schedule not found'}), 404

        new_start, new_end = parse_proposed_time(proposed_time)
        
        existing_schedules = list(db.schedules.find({
            '$or': [
                {'examinerId': ObjectId(examiner_id)},
                {'studentId': ObjectId(student_id)}
            ]
        }))

        if has_conflict(new_start, new_end, existing_schedules, examiner_id, student_id, schedule_id):
            return jsonify({'error': 'Proposed time conflicts with existing schedules'}), 409

        update_result = db.schedules.update_one(
            {'_id': ObjectId(schedule_id)},
            {
                '$set': {
                    'startTime': new_start.isoformat(),
                    'endTime': new_end.isoformat(),
                    'updatedAt': datetime.now(UTC).isoformat()
                }
            }
        )

        if update_result.modified_count == 0:
            return jsonify({'error': 'Failed to update schedule'}), 500

        updated_schedule = db.schedules.find_one({'_id': ObjectId(schedule_id)})
        return jsonify({
            'message': 'Schedule updated successfully',
            'schedule': {
                '_id': str(updated_schedule['_id']),
                'examinerId': str(updated_schedule['examinerId']),
                'studentId': str(updated_schedule['studentId']),
                'startTime': updated_schedule['startTime'],
                'endTime': updated_schedule['endTime'],
                'module': updated_schedule['module'],
                'googleMeetLink': updated_schedule['googleMeetLink']
            }
        }), 200

    except Exception as e:
        print(f'Reschedule error: {str(e)}')
        return jsonify({'error': f'Server error: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)