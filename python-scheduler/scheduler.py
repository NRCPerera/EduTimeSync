from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from bson.objectid import ObjectId
from pytz import UTC

app = Flask(__name__)
load_dotenv()

# Configure CORS to allow requests from the Node.js backend
CORS(app, resources={r"/*": {"origins": "http://localhost:5000"}})

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
    """Parse the proposed time in various formats and return start and end datetime objects"""
    print(f"Parsing proposed time: {proposed_time}, type: {type(proposed_time)}")
    
    try:
        # Case 1: If proposedTime is a string (ISO format)
        if isinstance(proposed_time, str):
            start_datetime = datetime.fromisoformat(proposed_time.replace('Z', '+00:00'))
            end_datetime = start_datetime + timedelta(minutes=30)  # Assuming 30 minutes duration
            print(f"Parsed ISO string: Start={start_datetime}, End={end_datetime}")
            return start_datetime, end_datetime
            
        # Case 2: If proposedTime is a dictionary with date and startTime/endTime
        elif isinstance(proposed_time, dict) and 'date' in proposed_time:
            date = datetime.fromisoformat(proposed_time['date'].replace('Z', '+00:00')).date()
            
            # Handle different time formats
            if 'startTime' in proposed_time:
                if ':' in proposed_time['startTime']:
                    # Format: HH:MM
                    start_time = datetime.strptime(proposed_time['startTime'], '%H:%M').time()
                else:
                    # Try to parse as ISO time portion
                    start_time = datetime.fromisoformat(proposed_time['startTime']).time()
                
                start_datetime = UTC.localize(datetime.combine(date, start_time))
                
                # Handle end time if available, otherwise default to start + 30 min
                if 'endTime' in proposed_time and proposed_time['endTime']:
                    if ':' in proposed_time['endTime']:
                        end_time = datetime.strptime(proposed_time['endTime'], '%H:%M').time()
                    else:
                        end_time = datetime.fromisoformat(proposed_time['endTime']).time()
                    end_datetime = UTC.localize(datetime.combine(date, end_time))
                else:
                    end_datetime = start_datetime + timedelta(minutes=30)
                    
                print(f"Parsed dict with time: Start={start_datetime}, End={end_datetime}")
                return start_datetime, end_datetime
        
        # Case 3: Format might be unknown, try something else
        print(f"Unknown format for proposed_time: {proposed_time}")
        raise ValueError(f"Unsupported proposedTime format: {proposed_time}")
            
    except Exception as e:
        print(f"Error in parse_proposed_time: {str(e)}")
        raise ValueError(f"Failed to parse proposedTime: {str(e)}")

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
    print(f'Received data: {data}')  # Debug log
    try:
        start_date = datetime.fromisoformat(data['startDate'].replace('Z', '+00:00'))
        end_date = datetime.fromisoformat(data['endDate'].replace('Z', '+00:00'))
        duration = data['duration']
        module = data['module']
        examiner_ids = data['examinerIds']
        event_id = data.get('eventId')
    except (KeyError, ValueError) as e:
        print(f'Error parsing request data: {str(e)}')
        return jsonify({'error': f'Invalid request data: {str(e)}'}), 400

    registrations = list(db.moduleregistrations.find({'moduleCode': module}))
    student_ids = [str(reg['studentId']) for reg in registrations]
    if not student_ids:
        print(f'No students registered for module: {module}')
        return jsonify({'error': 'No students registered for this module'}), 400

    examiner_ids_obj = [ObjectId(id) for id in examiner_ids]
    availabilities = list(db.examineravailabilities.find({'examinerId': {'$in': examiner_ids_obj}, 'module': module}))

    slots_by_examiner = {}
    for avail in availabilities:
        examiner_id = str(avail['examinerId'])
        date = avail['date']
        if start_date.date() <= date.date() <= end_date.date():
            slots = []
            for slot in avail['availableSlots']:
                start_time, end_time = parse_time_slot(slot, date)
                if start_date <= start_time and end_time <= end_date:
                    slots.append({'startTime': start_time, 'endTime': end_time})
            slots_by_examiner[examiner_id] = slots

    if not any(slots_by_examiner.values()):
        print('No examiner availability within event dates')
        return jsonify({'error': 'No examiner availability within event dates'}), 400

    existing_schedules = list(db.schedules.find({'$or': [
        {'examinerId': {'$in': examiner_ids_obj}},
        {'studentId': {'$in': student_ids}}
    ]}))

    schedules = []
    available_examiners = list(slots_by_examiner.keys())
    if not available_examiners:
        print('No examiners with available slots')
        return jsonify({'error': 'No examiners with available slots'}), 400

    examiner_index = 0
    for student_id in student_ids:
        examiner_id = available_examiners[examiner_index % len(available_examiners)]
        avail_slots = slots_by_examiner[examiner_id]

        scheduled = False
        for slot in avail_slots:
            current_start = slot['startTime']
            while current_start + timedelta(minutes=duration) <= slot['endTime']:
                current_end = current_start + timedelta(minutes=duration)
                if not has_conflict(current_start, current_end, existing_schedules + schedules, examiner_id, student_id):
                    schedule = {
                        'examinerId': examiner_id,
                        'studentId': student_id,
                        'startTime': current_start.isoformat(),
                        'endTime': current_end.isoformat(),
                        'googleMeetLink': f'https://meet.google.com/event-{len(schedules) + 1}',
                        'module': module,
                        'eventId': event_id
                    }
                    schedules.append(schedule)
                    scheduled = True
                    break
                current_start += timedelta(minutes=duration)
            if scheduled:
                break

        if not scheduled:
            print(f'No conflict-free slot for student: {student_id}')
            return jsonify({'error': f'No conflict-free slot for student {student_id}'}), 400
        examiner_index += 1

    print(f'Generated schedules: {schedules}')  # Debug log
    return jsonify({'schedules': schedules}), 200

@app.route('/reschedule/<schedule_id>', methods=['PUT'])
def reschedule_exam(schedule_id):
    data = request.get_json()
    print(f'Reschedule request data: {data}')  # Debug log
    proposed_time = data.get('proposedTime')
    examiner_id = data.get('examinerId')
    student_id = data.get('studentId')

    if not all([proposed_time, examiner_id, student_id]):
        print('Missing required fields')
        return jsonify({'error': 'Missing required fields: proposedTime, examinerId, studentId'}), 400

    try:
        schedule = db.schedules.find_one({'_id': ObjectId(schedule_id)})
        if not schedule:
            print(f'Schedule not found: {schedule_id}')
            return jsonify({'error': 'Schedule not found'}), 404

        new_start, new_end = parse_proposed_time(proposed_time)
        
        existing_schedules = list(db.schedules.find({
            '$or': [
                {'examinerId': ObjectId(examiner_id)},
                {'studentId': ObjectId(student_id)}
            ]
        }))

        if has_conflict(new_start, new_end, existing_schedules, examiner_id, student_id, schedule_id):
            print('Proposed time conflicts with existing schedules')
            return jsonify({'error': 'Proposed time conflicts with existing schedules'}), 409

        update_result = db.schedules.update_one(
            {'_id': ObjectId(schedule_id)},
            {
                '$set': {
                    'startTime': new_start,  # Store as datetime object
                    'endTime': new_end,      # Store as datetime object
                    'examinerId': ObjectId(examiner_id),
                    'studentId': ObjectId(student_id),
                    'updatedAt': datetime.now(UTC)  # Also store as datetime
                }
            }
        )

        if update_result.modified_count == 0:
            print('Failed to update schedule')
            return jsonify({'error': 'Failed to update schedule'}), 500

        updated_schedule = db.schedules.find_one({'_id': ObjectId(schedule_id)})
        print(f'Updated schedule: {updated_schedule}')  # Debug log
        return jsonify({
            'message': 'Schedule updated successfully',
            'schedule': {
                '_id': str(updated_schedule['_id']),
                'examinerId': str(updated_schedule['examinerId']),
                'studentId': str(updated_schedule['studentId']),
                'startTime': updated_schedule['startTime'].isoformat(),  # Convert to string for response
                'endTime': updated_schedule['endTime'].isoformat(),      # Convert to string for response
                'module': updated_schedule['module'],
                'googleMeetLink': updated_schedule.get('googleMeetLink')
            }
        }), 200
    except Exception as e:
        print(f'Error in reschedule_exam: {str(e)}')
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5001)