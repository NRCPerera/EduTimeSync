from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from bson.objectid import ObjectId
from pytz import UTC
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
load_dotenv()

# Configure CORS to allow requests from the Node.js backend
CORS(app, resources={r"/*": {"origins": "http://localhost:5000"}})

# MongoDB configuration
mongo_uri = os.getenv('MONGO_URI')
client = MongoClient(mongo_uri)
db = client.get_default_database()

# Email configuration
EMAIL_PROVIDER = os.getenv('EMAIL_PROVIDER', 'sendgrid')  # e.g., 'sendgrid', 'outlook', 'zoho', 'custom'
SMTP_SERVER = os.getenv('SMTP_SERVER', 'smtp.sendgrid.net')
SMTP_PORT = int(os.getenv('SMTP_PORT', 587))
SMTP_USERNAME = os.getenv('SMTP_USERNAME', 'apikey' if EMAIL_PROVIDER == 'sendgrid' else '')
SMTP_PASSWORD = os.getenv('SMTP_PASSWORD', os.getenv('SENDGRID_API_KEY') if EMAIL_PROVIDER == 'sendgrid' else '')
FROM_EMAIL = os.getenv('FROM_EMAIL', 'your_from_email@example.com')

def send_email(to_email, subject, body):
    """Send an email using SMTP and return success status."""
    try:
        msg = MIMEMultipart()
        msg['From'] = FROM_EMAIL
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.set_debuglevel(1)  # Enable debug output for SMTP
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.sendmail(FROM_EMAIL, to_email, msg.as_string())
        logger.info(f"Email sent to {to_email} via {EMAIL_PROVIDER}")
        return True
    except smtplib.SMTPAuthenticationError as e:
        logger.error(f"SMTP authentication failed for {to_email}: {str(e)}")
        return False
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        return False

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
    logger.info(f"Parsing proposed time: {proposed_time}, type: {type(proposed_time)}")
    
    try:
        if isinstance(proposed_time, str):
            start_datetime = datetime.fromisoformat(proposed_time.replace('Z', '+00:00'))
            end_datetime = start_datetime + timedelta(minutes=30)
            logger.info(f"Parsed ISO string: Start={start_datetime}, End={end_datetime}")
            return start_datetime, end_datetime
            
        elif isinstance(proposed_time, dict) and 'date' in proposed_time:
            date = datetime.fromisoformat(proposed_time['date'].replace('Z', '+00:00')).date()
            
            if 'startTime' in proposed_time:
                if ':' in proposed_time['startTime']:
                    start_time = datetime.strptime(proposed_time['startTime'], '%H:%M').time()
                else:
                    start_time = datetime.fromisoformat(proposed_time['startTime']).time()
                
                start_datetime = UTC.localize(datetime.combine(date, start_time))
                
                if 'endTime' in proposed_time and proposed_time['endTime']:
                    if ':' in proposed_time['endTime']:
                        end_time = datetime.strptime(proposed_time['endTime'], '%H:%M').time()
                    else:
                        end_time = datetime.fromisoformat(proposed_time['endTime']).time()
                    end_datetime = UTC.localize(datetime.combine(date, end_time))
                else:
                    end_datetime = start_datetime + timedelta(minutes=30)
                    
                logger.info(f"Parsed dict with time: Start={start_datetime}, End={end_datetime}")
                return start_datetime, end_datetime
        
        logger.error(f"Unknown format for proposed_time: {proposed_time}")
        raise ValueError(f"Unsupported proposedTime format: {proposed_time}")
            
    except Exception as e:
        logger.error(f"Error in parse_proposed_time: {str(e)}")
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
    logger.info(f'Received data: {data}')
    try:
        start_date = datetime.fromisoformat(data['startDate'].replace('Z', '+00:00'))
        end_date = datetime.fromisoformat(data['endDate'].replace('Z', '+00:00'))
        duration = data['duration']
        module = data['module']
        examiner_ids = data['examinerIds']
        event_id = data.get('eventId')
    except (KeyError, ValueError) as e:
        logger.error(f'Error parsing request data: {str(e)}')
        return jsonify({'error': f'Invalid request data: {str(e)}'}), 400

    # Fetch module registrations and join with users to get student emails
    registrations = list(db.moduleregistrations.find({'moduleCode': module}))
    if not registrations:
        logger.error(f'No students registered for module: {module}')
        return jsonify({'error': 'No students registered for this module'}), 400

    student_ids = [str(reg['studentId']) for reg in registrations]
    student_ids_obj = [ObjectId(id) for id in student_ids]
    
    # Fetch student emails from users collection
    students = list(db.users.find({'_id': {'$in': student_ids_obj}, 'role': 'Student'}))
    student_emails = {str(user['_id']): user.get('email') for user in students}

    examiner_ids_obj = [ObjectId(id) for id in examiner_ids]
    availabilities = list(db.examineravailabilities.find({'examinerId': {'$in': examiner_ids_obj}, 'module': module}))
    
    # Fetch examiner emails from users collection
    examiners = list(db.users.find({'_id': {'$in': examiner_ids_obj}, 'role': 'Examiner'}))
    examiner_emails = {str(user['_id']): user.get('email') for user in examiners}

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
        logger.error('No examiner availability within event dates')
        return jsonify({'error': 'No examiner availability within event dates'}), 400

    existing_schedules = list(db.schedules.find({'$or': [
        {'examinerId': {'$in': examiner_ids_obj}},
        {'studentId': {'$in': student_ids_obj}}
    ]}))

    schedules = []
    failed_emails = []
    available_examiners = list(slots_by_examiner.keys())
    if not available_examiners:
        logger.error('No examiners with available slots')
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
                        'examinerId': ObjectId(examiner_id),
                        'studentId': ObjectId(student_id),
                        'startTime': current_start,
                        'endTime': current_end,
                        'googleMeetLink': f'https://meet.google.com/event-{len(schedules) + 1}',
                        'module': module,
                        'eventId': event_id,
                        'createdAt': datetime.now(UTC)
                    }
                    schedules.append(schedule)
                    scheduled = True
                    
                    # Send email to student
                    student_email = student_emails.get(student_id)
                    if student_email:
                        subject = f"Exam Schedule for {module}"
                        body = (
                            f"Dear Student,\n\n"
                            f"You have been scheduled for an exam for {module}.\n"
                            f"Details:\n"
                            f"Date: {current_start.date()}\n"
                            f"Time: {current_start.strftime('%H:%M')} - {current_end.strftime('%H:%M')} UTC\n"
                            f"Examiner ID: {examiner_id}\n"
                            f"Google Meet Link: {schedule['googleMeetLink']}\n\n"
                            f"Please ensure you are available at the scheduled time.\n"
                            f"Best regards,\nExam Scheduling Team"
                        )
                        if not send_email(student_email, subject, body):
                            failed_emails.append({'email': student_email, 'reason': 'Failed to send student email'})
                    else:
                        logger.warning(f"No email found for student ID: {student_id}")
                        failed_emails.append({'email': student_id, 'reason': 'No email address for student'})
                    
                    # Send email to examiner
                    examiner_email = examiner_emails.get(examiner_id)
                    if examiner_email:
                        subject = f"Exam Schedule for {module}"
                        body = (
                            f"Dear Examiner,\n\n"
                            f"You have been scheduled to conduct an exam for {module}.\n"
                            f"Details:\n"
                            f"Student ID: {student_id}\n"
                            f"Date: {current_start.date()}\n"
                            f"Time: {current_start.strftime('%H:%M')} - {current_end.strftime('%H:%M')} UTC\n"
                            f"Google Meet Link: {schedule['googleMeetLink']}\n\n"
                            f"Please ensure you are available at the scheduled time.\n"
                            f"Best regards,\nExam Scheduling Team"
                        )
                        if not send_email(examiner_email, subject, body):
                            failed_emails.append({'email': examiner_email, 'reason': 'Failed to send examiner email'})
                    else:
                        logger.warning(f"No email found for examiner ID: {examiner_id}")
                        failed_emails.append({'email': examiner_id, 'reason': 'No email address for examiner'})
                    
                    break
                current_start += timedelta(minutes=duration)
            if scheduled:
                break

        if not scheduled:
            logger.error(f'No conflict-free slot for student: {student_id}')
            return jsonify({'error': f'No conflict-free slot for student {student_id}'}), 400
        examiner_index += 1

    # Save schedules to database
    if schedules:
        result = db.schedules.insert_many(schedules)
        # Update schedules with inserted _ids
        for i, schedule in enumerate(schedules):
            schedule['_id'] = str(result.inserted_ids[i])
    
    logger.info(f'Generated schedules: {schedules}')
    response = {
        'schedules': [{
            '_id': schedule['_id'],
            'examinerId': str(schedule['examinerId']),
            'studentId': str(schedule['studentId']),
            'startTime': schedule['startTime'].isoformat(),
            'endTime': schedule['endTime'].isoformat(),
            'googleMeetLink': schedule['googleMeetLink'],
            'module': schedule['module'],
            'eventId': schedule['eventId']
        } for schedule in schedules]
    }
    if failed_emails:
        response['failed_emails'] = failed_emails
    return jsonify(response), 200

@app.route('/reschedule/<schedule_id>', methods=['PUT'])
def reschedule_exam(schedule_id):
    data = request.get_json()
    logger.info(f'Reschedule request data: {data}')
    proposed_time = data.get('proposedTime')
    examiner_id = data.get('examinerId')
    student_id = data.get('studentId')

    if not all([proposed_time, examiner_id, student_id]):
        logger.error('Missing required fields')
        return jsonify({'error': 'Missing required fields: proposedTime, examinerId, studentId'}), 400

    try:
        schedule = db.schedules.find_one({'_id': ObjectId(schedule_id)})
        if not schedule:
            logger.error(f'Schedule not found: {schedule_id}')
            return jsonify({'error': 'Schedule not found'}), 404

        new_start, new_end = parse_proposed_time(proposed_time)
        
        # Fetch emails for student and examiner
        student = db.users.find_one({'_id': ObjectId(student_id), 'role': 'Student'})
        examiner = db.users.find_one({'_id': ObjectId(examiner_id), 'role': 'Examiner'})
        student_email = student.get('email') if student else None
        examiner_email = examiner.get('email') if examiner else None

        existing_schedules = list(db.schedules.find({
            '$or': [
                {'examinerId': ObjectId(examiner_id)},
                {'studentId': ObjectId(student_id)}
            ]
        }))

        if has_conflict(new_start, new_end, existing_schedules, examiner_id, student_id, schedule_id):
            logger.error('Proposed time conflicts with existing schedules')
            return jsonify({'error': 'Proposed time conflicts with existing schedules'}), 409

        update_result = db.schedules.update_one(
            {'_id': ObjectId(schedule_id)},
            {
                '$set': {
                    'startTime': new_start,
                    'endTime': new_end,
                    'examinerId': ObjectId(examiner_id),
                    'studentId': ObjectId(student_id),
                    'updatedAt': datetime.now(UTC)
                }
            }
        )

        if update_result.modified_count == 0:
            logger.error('Failed to update schedule')
            return jsonify({'error': 'Failed to update schedule'}), 500

        updated_schedule = db.schedules.find_one({'_id': ObjectId(schedule_id)})
        
        failed_emails = []
        # Send email to student
        if student_email:
            subject = f"Exam Reschedule for {updated_schedule['module']}"
            body = (
                f"Dear Student,\n\n"
                f"Your exam for {updated_schedule['module']} has been rescheduled.\n"
                f"New Details:\n"
                f"Date: {new_start.date()}\n"
                f"Time: {new_start.strftime('%H:%M')} - {new_end.strftime('%H:%M')} UTC\n"
                f"Examiner ID: {examiner_id}\n"
                f"Google Meet Link: {updated_schedule.get('googleMeetLink')}\n\n"
                f"Please ensure you are available at the new scheduled time.\n"
                f"Best regards,\nExam Scheduling Team"
            )
            if not send_email(student_email, subject, body):
                failed_emails.append({'email': student_email, 'reason': 'Failed to send student email'})
        else:
            logger.warning(f"No email found for student ID: {student_id}")
            failed_emails.append({'email': student_id, 'reason': 'No email address for student'})

        # Send email to examiner
        if examiner_email:
            subject = f"Exam Reschedule for {updated_schedule['module']}"
            body = (
                f"Dear Examiner,\n\n"
                f"Your exam for {updated_schedule['module']} has been rescheduled.\n"
                f"New Details:\n"
                f"Student ID: {student_id}\n"
                f"Date: {new_start.date()}\n"
                f"Time: {new_start.strftime('%H:%M')} - {new_end.strftime('%H:%M')} UTC\n"
                f"Google Meet Link: {updated_schedule.get('googleMeetLink')}\n\n"
                f"Please ensure you are available at the new scheduled time.\n"
                f"Best regards,\nExam Scheduling Team"
            )
            if not send_email(examiner_email, subject, body):
                failed_emails.append({'email': examiner_email, 'reason': 'Failed to send examiner email'})
        else:
            logger.warning(f"No email found for examiner ID: {examiner_id}")
            failed_emails.append({'email': examiner_id, 'reason': 'No email address for examiner'})

        logger.info(f'Updated schedule: {updated_schedule}')
        response = {
            'message': 'Schedule updated successfully',
            'schedule': {
                '_id': str(updated_schedule['_id']),
                'examinerId': str(updated_schedule['examinerId']),
                'studentId': str(updated_schedule['studentId']),
                'startTime': updated_schedule['startTime'].isoformat(),
                'endTime': updated_schedule['endTime'].isoformat(),
                'module': updated_schedule['module'],
                'googleMeetLink': updated_schedule.get('googleMeetLink')
            }
        }
        if failed_emails:
            response['failed_emails'] = failed_emails
        return jsonify(response), 200
    except Exception as e:
        logger.error(f'Error in reschedule_exam: {str(e)}')
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    # Verify email configuration at startup
    if not all([SMTP_USERNAME, SMTP_PASSWORD, FROM_EMAIL]):
        logger.error(f"SMTP_USERNAME, SMTP_PASSWORD, or FROM_EMAIL not set for {EMAIL_PROVIDER} in .env file")
    app.run(debug=True, port=5001)