from __future__ import print_function

import datetime
import json
import os.path
import pickle

from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

# If modifying these scopes, delete the file token.pickle.
SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']

creds = None
# The file token.pickle stores the user's access and refresh tokens, and is
# created automatically when the authorization flow completes for the first
# time.
if os.path.exists('cal/token.pickle'):
    with open('cal/token.pickle', 'rb') as token:
        creds = pickle.load(token)
# If there are no (valid) credentials available, let the user log in.
if not creds or not creds.valid:
    if creds and creds.expired and creds.refresh_token:
        creds.refresh(Request())
    else:
        flow = InstalledAppFlow.from_client_secrets_file('cal/credentials.json', SCOPES)
        creds = flow.run_local_server()
    # Save the credentials for the next run
    with open('cal/token.pickle', 'wb') as token:
        pickle.dump(creds, token)

service = build('calendar', 'v3', credentials=creds)

# Get times
localNow = datetime.datetime.now()
utcNow = datetime.datetime.utcnow()
offset = utcNow - localNow
start = (datetime.datetime(utcNow.year, utcNow.month, utcNow.day)+offset).isoformat() + 'Z'
end = (datetime.datetime(utcNow.year, utcNow.month, utcNow.day, hour=23, minute=59)+offset).isoformat() + 'Z'

# Get Holidays
events_result = service.events().list(calendarId='en.usa#holiday@group.v.calendar.google.com', timeMin=start, timeMax=end, singleEvents=True, orderBy='startTime').execute()
events = events_result.get('items', [])

# Get today's events
events_result = service.events().list(calendarId='primary', timeMin=start, timeMax=end, singleEvents=True, orderBy='startTime').execute()
events += events_result.get('items', [])

# Tomorrow Holidays
delta = datetime.timedelta(days=1)
tomStart = (datetime.datetime(utcNow.year, utcNow.month, utcNow.day)+delta+offset).isoformat() + 'Z'
tomEnd = (datetime.datetime(utcNow.year, utcNow.month, utcNow.day, hour=23, minute=59)+delta+offset).isoformat() + 'Z'
events_result = service.events().list(calendarId='en.usa#holiday@group.v.calendar.google.com', timeMin=tomStart, timeMax=tomEnd, singleEvents=True, orderBy='startTime').execute()
events += events_result.get('items', [])

# Get tomorrow's events
events_result = service.events().list(calendarId='primary', timeMin=tomStart, timeMax=tomEnd, singleEvents=True, orderBy='startTime').execute()
events += events_result.get('items', [])

# Get next 3 events if none are found today/tomorrow
if not events:
    end = (datetime.datetime(utcNow.year, utcNow.month, utcNow.day, hour=23, minute=59)+offset+datetime.timedelta(minutes=1)).isoformat() + 'Z'
    events_result = service.events().list(calendarId='primary', timeMin=end, maxResults=3, singleEvents=True, orderBy='startTime').execute()
    events += events_result.get('items', [])

# Collect results
data = {}
count = 0
for event in events:
    data[count] = event
    count += 1

with open('cal/events.json', 'w') as f:
    f.write(json.dumps(data, indent=4))
