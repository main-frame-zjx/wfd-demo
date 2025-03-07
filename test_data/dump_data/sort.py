import os

file = open ("result.txt", 'r')
resultFile = open("result2.txt", mode='w', mode='w', encoding='utf-8')

strList=[]
for line in file.readlines():
    if line != '' and line != '\n':
        strList. append (line)
strList.sort()
for str in strList:
    resultFile.write(str)

resultFile.close()