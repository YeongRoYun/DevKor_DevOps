import os
import sys
import json

with open('./config.json', 'r') as fd:
    updatedList = sys.argv[1:]
    config = json.loads(fd.read())
    for updatedCode in updatedList:
        if updatedCode not in config['codeList']:
            print('Error: not found {}'.format(updatedCode))
            continue
        else:
            dependencies = config['codeDependency'][updatedCode]

            testFiles = [config['codeAndTestRelation'][updatedCode]]
            for code in dependencies:
                testFiles.append(config['codeAndTestRelation'][code])
            for test in testFiles:
                os.system("python {}".format(os.path.join(config['testDir'], test)))
