import os

file = open ("result2.txt", 'r')
resultFile = open ("result3.txt", mode= 'w' , encoding='utf-8')

dic=dict()
for line in file.readlines():
    lineList=line.split()
    cycle=int(lineList[0])
    if cycle not in dic.keys():
        l=[]
        l.append(lineList[2])
        dic[cycle]=l
    else:
        valueList=dic[cycle]
        valueList.append(lineList[2])
for key in dic. keys():
    for value in dic[key]:
        num=0
        for cycle in range(key-25, key+25):
            if cycle in dic.keys() and value in dic[cycle]:
                num+=1
        frequency=num/50 #float
        resultFile.write(str(key)+' '+value+' ')
        resultFile.write("{:.2f}\n".format(frequency))
resultFile.close