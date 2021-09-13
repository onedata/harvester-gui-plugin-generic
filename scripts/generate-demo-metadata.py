#!/usr/bin/env python
# coding=utf-8

"""
Generates example metadata by creating a directory with N empty files. Each file has
JSON metadata attached, which represents simple values like dates, names, numbers etc.

To work, needs three positional arguments passed:
- provider location (domain or IP address),
- space name,
- access token.
Generation process might be adjusted by setting another target directory on the space
(default is "demo_metadata") or different files number to generate (default is 300).
"""

__author__ = 'Michał Borzęcki'
__copyright__ = 'Copyright (C) 2020 ACK CYFRONET AGH'
__license__ = 'This software is released under the MIT license cited in LICENSE.txt'

import os
import subprocess
import json
import math
import random
import time
from datetime import datetime
import argparse
import requests


def define_arguments_parser():
    parser = argparse.ArgumentParser(
        description='Generates example files with metadata on a given space.'
    )

    parser.add_argument(
        'provider',
        help='Provider location (domain name/IP address)'
    )

    parser.add_argument(
        'space',
        help='Space name'
    )

    parser.add_argument(
        'token',
        help='Access token'
    )

    parser.add_argument(
        '-d', '--directory',
        default='demo_metadata',
        help='Target directory on a space (may not exist)',
        dest='directory'
    )

    parser.add_argument(
        '-n', '--files-number',
        type=int,
        default=300,
        help='Number of files to generate',
        dest='files_count'
    )

    return parser


def read_arguments():
    parser = define_arguments_parser()
    args = parser.parse_args()
    if not args.files_count or args.files_count < 0:
        parser.error('Number of files must be greater than 0.')

    return args


def load_words_list():
    word_source_url = 'https://svnweb.freebsd.org/csrg/share/dict/words?view=co&content-type=text/plain'
    headers = {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/77.0.3865.90 Chrome/77.0.3865.90 Safari/537.36'
    }
    response = requests.get(word_source_url, headers=headers)
    words = [word.decode('utf-8') for word in response.content.splitlines()]
    return {
        'name_words': [w for w in words if w[0].isupper() and not w.isupper()],
        'words': words,
    }


def run_space_curl(script_args, relative_path, method, data_to_send=None,
                   is_cdmi_object=False):
    content_type = 'application/cdmi-' + ('object' if is_cdmi_object else 'container')
    curl_command_elements = [
        'curl',
        '-k',
        '-H', f'X-Auth-Token: {script_args.token}',
        '-H', 'X-CDMI-Specification-Version: 1.1.1',
        '-H', f'Content-Type: {content_type}',
        '-X', method,
    ]
    if data_to_send:
        curl_command_elements.extend(('-d', data_to_send))

    curl_command_elements.append(
        f'https://{script_args.provider}/cdmi/{script_args.space}{relative_path}'
    )

    return subprocess.Popen(
        curl_command_elements,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )


def recreate_target_directory(script_args):
    run_space_curl(script_args, f'/{args.directory}/', 'DELETE').wait()
    run_space_curl(script_args, f'/{args.directory}/', 'PUT').wait()


def generate_metadata(file_no, sample_data):
    statuses = ('open', 'pending', 'closing', 'closed', 'rejected')
    keyword_count = random.randint(1, 8)
    edition_time = datetime.fromtimestamp(int(time.time()) - file_no * 7200)
    return json.dumps({
        'id': file_no,
        'creator': ' '.join((random.choice(sample_data['name_words']) for _ in range(2))),
        'status': {
            'now': random.choice(statuses),
            'prev': random.choice(statuses),
        },
        'keywords': [random.choice(sample_data['words']) for _ in range(keyword_count)],
        'enabled': random.random() > 0.5,
        'html': '<b>no content</b>',
        'editionTime': edition_time.strftime('%Y/%m/%d %H:%M:%S'),
    });


def create_single_file(script_args, file_no, sample_data):
    filename = 'file_' + str(file_no).zfill(len(str(args.files_count)));
    metadata = generate_metadata(file_no, sample_data)
    return run_space_curl(script_args, f'/{args.directory}/{filename}', 'PUT',
                          data_to_send='{"metadata": {"onedata_json": ' + metadata + '}}',
                          is_cdmi_object=True)


def create_range_of_files(script_args, range_start, range_end, sample_data):
    pending_curls = []
    for i in range(range_start, range_end):
        pending_curls.append(create_single_file(args, i, sample_data))
    for pending_curl in pending_curls:
        pending_curl.wait()


def create_files(script_args):
    sample_data = load_words_list();
    files_created_counter = 0
    while files_created_counter < args.files_count:
        files_range_start = files_created_counter
        files_range_end = min(files_range_start + 200, args.files_count)
        create_range_of_files(args, files_range_start, files_range_end, sample_data)

        files_created_counter = files_range_end
        print(str(files_created_counter) + ' curls done')


if __name__ == '__main__':
    args = read_arguments()
    recreate_target_directory(args)
    create_files(args)
