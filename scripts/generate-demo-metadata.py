import os
import sys
import subprocess
import json
import math
import urllib.request
import random

provider = sys.argv[1]
space = sys.argv[2]
token = sys.argv[3]
directory = sys.argv[4]
files_no = int(sys.argv[5])

FNULL = open(os.devnull, 'w')

curl = [
  'curl',
  '-k',
  '-H', 'X-Auth-Token: ' + token,
  '-H', 'X-CDMI-Specification-Version: 1.1.1',
  '-H', 'Content-Type: application/cdmi-container',
  '-X', 'DELETE',
  'https://' + provider + '/cdmi/' + space + '/' + directory + '/'
]

remove_dir_proc = subprocess.Popen(curl, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
remove_dir_proc.wait()

curl = [
  'curl',
  '-k',
  '-H', 'X-Auth-Token: ' + token,
  '-H', 'X-CDMI-Specification-Version: 1.1.1',
  '-H', 'Content-Type: application/cdmi-container',
  '-X', 'PUT',
  'https://' + provider + '/cdmi/' + space + '/' + directory + '/'
]

create_dir_proc = subprocess.Popen(curl, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
create_dir_proc.wait()

word_url = "http://svnweb.freebsd.org/csrg/share/dict/words?view=co&content-type=text/plain"
response = urllib.request.urlopen(word_url)
long_txt = response.read().decode()
words = long_txt.splitlines()
name_words = [word for word in words if word[0].isupper() and not word.isupper()]

processes = []
processes_done_counter = 0
file_no_length = math.ceil(math.log(files_no + 1, 10))
statuses = ('open', 'pending', 'closing', 'closed', 'rejected')
for i in range(files_no):
  filename = 'file_' + str(i).zfill(file_no_length);

  entry_id = i
  rand_name = ' '.join([name_words[random.randint(0, len(name_words) - 1)] for i in range(2)])
  keywords = ', '.join(['"' + words[random.randint(0, len(words) - 1)] + '"' for i in range(random.randint(1, 8))])
  status = random.choice(statuses)
  prev_status = random.choice(statuses)
  html = '<b>no content</b>'
  metadata = '{{"id": {0}, "creator": "{1}", "status": {{"now": "{2}", "prev": "{3}" }}, "keywords": [{4}], "html": "{5}" }}'.format(entry_id, rand_name, status, prev_status, keywords, html)

  curl = [
    'curl',
    '-k',
    '-H', 'X-Auth-Token: ' + token,
    '-H', 'X-CDMI-Specification-Version: 1.1.1',
    '-H', 'Content-Type: application/cdmi-object',
    '-X', 'PUT',
    '-d', '{"metadata": {"onedata_json": ' + metadata + '}}',
    'https://' + provider + '/cdmi/' + space + '/' + directory + '/' + filename
  ]
  processes.append(subprocess.Popen(curl, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL))
  if len(processes) == 1000:
    for proc in processes:
      proc.wait()
    processes_done_counter += 1000
    print(str(processes_done_counter) + ' curls done')
    processes = []
for proc in processes:
  proc.wait()
if len(processes) is not 0:
  processes_done_counter += len(processes)
  print(str(processes_done_counter) + ' curls done')
