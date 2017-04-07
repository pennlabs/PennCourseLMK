from penn import Registrar
import json
import sys

def fetch_courses(term):
    '''Fetches the courses in the given term. The
    function uses the Penn SDK Registrar in order to
    obtain this list.

    Only needs to be run once a semester in order to fetch all the courses.'''
    r = Registrar("UPENN_OD_endI_1003504","1p5smognls3qbsli6ml50vb97d")
    s = r.search({'term': term})
    courses = []
    for i in s:
        s = i['section_id']
        section_id = ' '.join([s[0:4].strip(), s[4:7], s[7:10]])
        course_title = i['course_title']
        instructors = [j['name'] for j in i['instructors']]
        meetings = i['meetings']
        meeting_days = [meeting['meeting_days'] + ' ' + meeting['start_time'] + ' - ' + meeting['end_time'] for meeting in meetings]
        courses.append({'section_id': section_id, 'course_title': course_title, 'instructors': instructors, 'meeting_days': meeting_days})
    return courses

with open('courses.json','w') as f:
    json.dumps(fetch_courses(sys.argv[1]), f)
    f.close()