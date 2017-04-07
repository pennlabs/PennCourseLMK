# PennCourseLMK
Getting started:
1. Do `npm install`
2. Make sure you have [MongoDB](https://www.mongodb.com/download-center) installed. Create a `data/db` directory and run `mongod --dbpath=data/db`.
3. Run `npm run dev` to start the express server, and go to http://localhost:3000/


## In production
Set the `LMK_PASSWORD` environment variable appropriately.

## Fetching the current courses
To fetch the list of all courses for a given semester, first do `pip install -r requirements.txt`, then `python import_courses.py <semester_id>`. `semester_id` should be in the format `2017C`, the year followed by A,B, or C (Spring, Summer, Fall).