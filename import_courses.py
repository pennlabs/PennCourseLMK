from penn import Registrar

# Needs to be run once a semester in order to fetch all the courses
def fetch_courses(term):
    r = Registrar("UPENN_OD_endI_1003504","1p5smognls3qbsli6ml50vb97d")
    s = r.search({'term': term})
    courses = []
    for i in s:
        section_id = i['section_id']
        course_title = i['course_title']
        instructors = [j['name'] for j in i['instructors']]
        meetings = i['meetings']
        meeting_days = [meeting['meeting_days'] + ' ' + meeting['start_time'] + ' - ' + meeting['end_time'] for meeting in meetings]
        courses.append({'section_id': section_id, 'course_title': course_title, 'instructors': instructors, 'meeting_days': meeting_days})
    return courses
