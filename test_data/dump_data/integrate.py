import os
base_dir="/wfd-demo/test_data/dump_data/"
resultFile = open('result.txt', mode='w', encoding='utf-8')
class DumpFile: ...
files = [os.path.join(base_dir, file) for file in os.listdir(base_dir)] #files are all files under folder:base_dir
dFiles = []
for file in files:
    if os. path. isfile(file):
        fileName=os. path.basename(file)
        print (fileName)
        if(fileName.startswith('integrate')):
            continue 
        df=DumpFile(fileName)
        with open(file, 'r') as f: #each file
            flag=0
            num=0
            className=""
            for line in f.readlines(): #each Line
                #print(Line)
                if line.startswith('class'): #find name of class
                    listLine=line. split() 
                    className=listLine [1]
                if flag==1 and line!='\n':
                    #print(Line)
                    #print(num)
                    listLine=line.split()
                    df.setValue(listLine) #put data into valueList 
                    resultFile.write(listLine[num]) #find current cycle 
                    #print(ListLine[num])
                    df.setN(num+1)
                    resultFile.write(' className: ')
                    resultFile.write (className)
                    resultFile.write(' fileName: ')
                    resultFile.write(fileName)
                    resultFile.write('\n')
                if line.startswith('endclass'):
                    flag=1
                if flag==0:
                    num+=1
                    if not line.startswith('class') and not line.startswith('endclass'):
                        df. setKey (line)
        dFiles. append(df)
resultFile.close()