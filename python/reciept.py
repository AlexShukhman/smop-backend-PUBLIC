import json, os, sys
from openpyxl import load_workbook

"""
This script is for creating receipts for Smop coders using data given from mongo
"""

def readIn():
    lines = sys.stdin.readlines()
    return json.loads(lines[0])

def main():
    lines = readIn()

    #Ensure in correct directory
    directory_name = './api/models/'
    # #template file name
    template_file_name = 'Smop_Sales_Receipt_Template1.xlsx'
    #winner's username
    winner_name = lines[1]
    #winner's email
    winner_email = lines[2]
    #task name
    task_name = lines[3]
    #owner name
    owner_name = lines[4]
    #bounty
    bounty = lines[0]
    print(bounty, winner_email, winner_name, task_name, owner_name)

    wb = load_workbook(filename = directory_name + template_file_name)
    ws1 = wb.active

    ws1['C5'] = winner_name
    ws1['C6'] = winner_email
    ws1['B11'] = 1.0
    ws1['D11'] = 'Top 3 Payout for task "%s" by %s' % (task_name, owner_name)
    ws1['F11'] = bounty

    wb.save(filename = task_name + '_' + winner_name + '.xlsx')

if __name__ == '__main__':
    main()