class MxModule {
    constructor(m_id, name, instance_num, module_type) {
        this.m_id = m_id;
        this.name = name;
        this.instance_num = instance_num;
        this.module_type = module_type;
    }
}

class MxModuleInstance {
    constructor(mi_id, mptr_id, module_name, index) {
        this.mi_id = mi_id;
        this.mptr_id = mptr_id;
        this.module_name = module_name;
        this.index = index;
    }
}

class MxPort {
    constructor(p_id, port_type, instance_num, name) {
        this.p_id = p_id;
        this.port_type = port_type;
        this.instance_num = instance_num;
        this.name = name;
    }
}



class MxPortInstance {
    constructor(pi_id, name, dump_file_name, index, receive_index, transmit_index) {
        this.pi_id = pi_id;
        this.name = name;
        this.dump_file_name = dump_file_name;
        this.index = index
        this.receive_index = receive_index;
        this.transmit_index = transmit_index;
    }
};




/**
     * 计算字符串方程（连接字符串字面量）
     * 处理类似 'hello' + 'world' 的字符串连接
     * @param {string} input - 输入的字符串方程
     * @returns {string} 处理后的连接结果
     */
function calcStringEquation(input) {
    let result = '';
    let currentString = '';
    let inString = false; // 标识是否在字符串字面量中
    // console.log(`calcStringEquation(${input})`);

    for (let i = 0; i < input.length; i++) {
        const ch = input[i];

        if (ch === "\"") {
            // 如果当前在字符串字面量中，遇到引号则结束字符串字面量
            if (inString) {
                // 将当前字符串字面量添加到结果中
                result += currentString;
                currentString = ''; // 清空当前字符串字面量
                inString = false; // 标识结束字符串字面量
            } else {
                inString = true; // 标识开始字符串字面量
            }
        } else if (ch === '+' && !inString) {
            // 如果不在字符串字面量中，且遇到加号，则将之前的字符串字面量添加到结果中
            if (currentString !== '') {
                result += currentString;
                currentString = ''; // 清空当前字符串字面量
            }
        } else {
            // 如果在字符串字面量中，或者不在字符串字面量中但不是加号，则添加到当前字符串字面量
            currentString += ch;
        }
    }

    // 添加最后一个字符串字面量到结果中
    if (currentString !== '') {
        result += currentString;
    }

    return result;
};

/**
 * 去除字符串中的所有空格
 * @param {string} input - 输入的字符串
 * @returns {string} 去除空格后的字符串
 */
function noSpaceString(input) {
    let result = '';

    // 使用for循环遍历字符串，将非空格字符添加到结果中
    for (let i = 0; i < input.length; i++) {
        const char = input[i];
        // 检查字符是否为空格（包括空格、制表符、换行符等）
        if (char !== ' ' && char !== '\t' && char !== '\n' && char !== '\r') {
            result += char;
        }
    }

    return result;
};


/**
 * 检查字符串是否以"tx"结尾（不区分大小写）
 * 如果结尾有数组下标（如[0]），会先删除再比较
 * @param {string} str - 要检查的字符串
 * @returns {boolean} 是否以"tx"结尾
 */
function endsWithTx(str) {
    // 转换为小写
    str = str.toLowerCase();

    // 查找并移除数组下标部分
    const bracketPos = str.indexOf('[');
    if (bracketPos !== -1) {
        str = str.substring(0, bracketPos);
    }

    // 检查字符串长度是否足够
    if (str.length < 2) return false;

    // 检查最后两个字符是否为"tx"
    return str.substring(str.length - 2) === "tx";
};

/**
 * 检查字符串是否以"rx"结尾（不区分大小写）
 * 如果结尾有数组下标（如[0]），会先删除再比较
 * @param {string} str - 要检查的字符串
 * @returns {boolean} 是否以"rx"结尾
 */
function endsWithRx(str) {
    // 转换为小写
    str = str.toLowerCase();

    // 查找并移除数组下标部分
    const bracketPos = str.indexOf('[');
    if (bracketPos !== -1) {
        str = str.substring(0, bracketPos);
    }

    // 检查字符串长度是否足够
    if (str.length < 2) return false;

    // 检查最后两个字符是否为"rx"
    return str.substring(str.length - 2) === "rx";
};


/**
 * 把形如ptr_obj->GFD_GIA_draw_cmd_port[0]的复杂调用切割
 * @param {string} input - 输入的参数字符串
 * @returns {Array} 分割后的字符串数组
 */
function paramSplit(input) {
    const result = [];
    let pos = 0;
    let token = '';

    // 查找 '.' 或 '->' 的位置
    while ((pos = input.indexOf('.', pos)) !== -1 ||
        (pos = input.indexOf('->', pos)) !== -1) {
        // 获取分隔符之前的子字符串
        if (pos > 0) {
            token = input.substring(0, pos);
            result.push(token);
        }

        // 移动到分隔符之后的位置
        if (input[pos] === '.') {
            pos += 1; // 跳过 '.'
        } else if (input[pos] === '-' && pos + 1 < input.length && input[pos + 1] === '>') {
            pos += 2; // 跳过 '->'
        } else {
            console.log("error condition in paramSplit(), not . or -> !");
            break;
        }

        input = input.substring(pos); // 移除已处理的部分
        pos = 0; // 重置位置
    }

    // 添加最后一个子字符串
    if (input.length > 0) {
        result.push(input);
    }

    return result;
};




/**
     * 从参数中获取最后一个部分的端口实例
     * @param {string} param - 参数字符串
     * @param {Map} portInstanceMap - 端口实例映射表
     * @returns {MxPortInstance|null} 找到的端口实例或null
     */
function getPortInstanceInLastPart(param, portInstanceMap) {
    const params = paramSplit(param);
    if (params.length === 0) {
        console.log("error in getPortInstanceInLastPart(), params.empty() = true !");
        return null;
    }


    const lastParam = params[params.length - 1];
    //console.log(param, 'last part', lastParam);
    const multiPortRegex = /(\w+)\[(\d+)\]/;
    const match = multiPortRegex.exec(lastParam);

    if (match) {
        const portName = match[1];
        const index = parseInt(match[2]);
        const searchKey = `${portName}_${index}`;

        if (!portInstanceMap.has(searchKey)) {
            console.log(`in function getPortInstanceInLastPart(), not find define of : ${portName}[${index}]`);
            return null;
        } else {
            return portInstanceMap.get(searchKey);
        }
    } else {
        const portName = lastParam;
        const index = 0;
        const searchKey = `${portName}_${index}`;

        if (!portInstanceMap.has(searchKey)) {
            console.log(`in function getPortInstanceInLastPart(), not find define of : ${portName}`);
            return null;
        } else {
            return portInstanceMap.get(searchKey);
        }
    }
};



/**
* 分析参数并根据其为Tx还是Rx，将其设置为port的一个参数
* @param {MxPortInstance} portInstance - 端口实例对象
* @param {Map} moduleInstanceMap - 模块实例映射表
* @param {string} param - 参数字符串
*/
function setOneEndOfPortInstance(portInstance, moduleInstanceMap, param) {
    const params = paramSplit(param);
    if (params.length < 2) {
        console.error(`error in setOneEndOfPortInstance(), ${param} not satisfy part>=2`);
        return;
    }

    const lastParam = params[params.length - 1];
    const is_tx = endsWithTx(lastParam);
    const is_rx = endsWithRx(lastParam);

    if (!is_tx && !is_rx) {
        console.error(`error in setOneEndOfPortInstance(), ${param} not end with Tx/Rx`);
        return;
    }

    // 取倒数第二部分
    const moduleParam = params[params.length - 2];
    let moduleInstance = null;

    const multiModuleRegex = /(\w+)\[(\d+)\]/;
    const matches = multiModuleRegex.exec(moduleParam);

    if (matches) {
        const moduleName = matches[1];
        const index = parseInt(matches[2]);
        const searchKey = `${moduleName}_${index}`;

        if (!moduleInstanceMap.has(searchKey)) {
            console.error(`not find define of : ${moduleName}[${index}]`);
        } else {
            moduleInstance = moduleInstanceMap.get(searchKey);
        }
    } else {
        const moduleName = moduleParam;
        const index = 0;
        const searchKey = `${moduleName}_${index}`;

        if (!moduleInstanceMap.has(searchKey)) {
            console.error(`not find define of : ${moduleName}`);
        } else {
            moduleInstance = moduleInstanceMap.get(searchKey);
        }
    }

    if (is_tx) {
        // portInstance.has_t = true;
        portInstance.transmit_index = moduleInstance.mi_id;
    }

    if (is_rx) {
        // portInstance.has_r = true;
        portInstance.receive_index = moduleInstance.mi_id;
    }
};


const CodeProcessFunc = {


    /**
     * 展开for循环（将for循环替换为展开后的代码）
     * @param {string} code - 输入的代码字符串
     * @returns {string} 展开for循环后的代码
     */
    expandForLoop(code) {
        // 匹配for循环的正则表达式：for(...){...}
        const forLoopRegex = /for\s*\([^)]*\)\s*\{[^}]*?\}/g;
        let result = '';
        let lastIndex = 0;
        let match;

        while ((match = forLoopRegex.exec(code)) !== null) {
            // 添加非for循环部分
            result += code.substring(lastIndex, match.index);
            const forLoop = match[0];

            // 提取for循环细节：for(int i=0; i<N; i++){...}
            const initRegex = /for\s*\(\s*int\s+(\w+)\s*=\s*(\d+)\s*;\s*(\w+)\s*<\s*(\d+)\s*;[^)]*\)\s*\{([^}]*)\}/;
            const initMatch = forLoop.match(initRegex);

            if (initMatch) {
                const [_, varName1, startStr, varName2, endStr, loopBody] = initMatch;
                const start = parseInt(startStr);
                const end = parseInt(endStr);

                // 检查循环变量名是否一致
                if (varName1 !== varName2) {
                    console.error(`非法for循环: ${varName1} 与 ${varName2} 不一致`);
                    result += forLoop; // 保留原for循环
                } else {
                    let expandedCode = '';
                    // 展开循环：将循环体重复end-start次
                    for (let i = start; i < end; i++) {
                        // 替换循环变量（使用单词边界确保精确匹配）
                        const varRegex = new RegExp(`\\b${varName1}\\b`, 'g');
                        expandedCode += loopBody.replace(varRegex, i.toString());
                    }
                    result += expandedCode;
                }
            } else {
                console.error('展开for循环失败!');
                result += forLoop; // 保留原for循环
            }
            lastIndex = forLoopRegex.lastIndex;
        }

        // 添加剩余代码
        result += code.substring(lastIndex);
        return result;
    },

    /**
     * 替换to_string调用（将to_string(123)转换为"123"）
     * @param {string} code - 输入的代码字符串
     * @returns {string} 替换后的代码
     */
    replaceToString(code) {
        // 匹配to_string(数字)的正则表达式
        const to_stringRegex = /to_string\s*\(\s*(\d+)\s*\)/g;
        let result = '';
        let lastIndex = 0;
        let match;

        while ((match = to_stringRegex.exec(code)) !== null) {
            // 添加非匹配部分
            result += code.substring(lastIndex, match.index);
            // 替换为字符串字面量
            result += `"${match[1]}"`;
            lastIndex = to_stringRegex.lastIndex;
        }

        // 添加剩余代码
        result += code.substring(lastIndex);
        return result;
    },




    extractModule(code, moduleNameMap, moduleArray) {
        // 清空容器
        moduleArray.length = 0;
        moduleNameMap = {};

        // 正则表达式用于寻找所有形如 CvsdBlock *vsd_module[4]; 的代码
        const multiModuleRegex = /(C\w*?Block)\s*\*\s*(\w+)\[(\d+)\];/g;
        let match;
        let count = 0;

        // 处理多模块声明
        while ((match = multiModuleRegex.exec(code)) !== null) {
            const classType = match[1];
            const name = match[2];
            const num = parseInt(match[3]);

            const newModule = new MxModule(count, name, num, 'Multi');
            count++;
            moduleNameMap[newModule.name] = newModule;
            moduleArray.push(newModule);
        }

        //console.log("succ multiBlock");

        // 正则表达式用于寻找所有形如 CBlock *block; 的代码
        const singleModuleRegex = /(C\w*?Block)\s*\*\s*(\w+)\s*;/g;

        // 处理单模块声明
        while ((match = singleModuleRegex.exec(code)) !== null) {
            const classType = match[1];
            const name = match[2];

            const newModule = new MxModule(count, name, 1, 'Single');
            count++;
            moduleNameMap[newModule.name] = newModule;
            moduleArray.push(newModule);
        }

        //console.log("succ singleBlock");
    },




    generateModuleInstance(moduleArray, moduleInstanceMap, moduleInstanceArray) {
        // 清空容器
        moduleInstanceArray.length = 0;
        moduleInstanceMap.clear();

        // 遍历所有模块
        for (const module_ptr of moduleArray) {
            // 为每个模块创建指定数量的实例
            for (let i = 0; i < module_ptr.instance_num; i++) {
                let count = moduleInstanceArray.length
                const new_instance = new MxModuleInstance(count, module_ptr.m_id, module_ptr.name, i);

                moduleInstanceArray.push(new_instance);

                // 使用字符串作为键（JavaScript Map不支持对象作为键）
                const key = `${module_ptr.name}_${i}`;
                moduleInstanceMap.set(key, new_instance);
            }
        }
    },


    printModules(moduleArray) {
        console.log("Found modules:");
        moduleArray.forEach(module => {
            console.log(`ID: ${module.m_id}, Type: ${module.module_type}, Name: ${module.name}, Num: ${module.instance_num}`);
        });
    },


    printModuleInstances(moduleInstanceArray) {
        console.log("Module Instances:");
        moduleInstanceArray.forEach(instance => {
            console.log(`Instance ID: ${instance.mi_id}, ` +
                `Module: ${instance.module_name}, ` +
                `Index: ${instance.index}, `);
        });
    },

    printModuleInstancesMap(moduleInstanceMap) {
        console.log("Module Instances Map:");
        moduleInstanceMap.forEach((value, key) => {
            console.log(`${key} : ` +
                `Module: ${value.mi_id}, `);
        });
    },

    //----------------------------------------------------------------------
    // Port

    extractPort(code, portNameMap, portArray) {
        // 清空容器
        portNameMap.clear();
        portArray.length = 0;

        // 正则表达式用于寻找所有形如 Port *port_name[4]; 的代码
        const multiPortRegex = /Port\s*\*\s*(\w+)\[(\d+)\]/g;
        let match;

        // 处理多端口声明
        while ((match = multiPortRegex.exec(code)) !== null) {
            const name = match[1];
            const num = parseInt(match[2]);

            const newPort = new MxPort(portArray.length, 'Multi', num, name);
            portNameMap.set(newPort.name, newPort);
            portArray.push(newPort);
        }

        //console.log("succ multiPort");

        // 正则表达式用于寻找所有形如 Port *port_name; 的代码
        const singlePortRegex = /Port\s*\*\s*(\w+)\s*[;|=|\s]/g;

        // 处理单端口声明
        while ((match = singlePortRegex.exec(code)) !== null) {
            const name = match[1];
            const newPort = new MxPort(portArray.length, 'Single', 1, name);
            portNameMap.set(newPort.name, newPort);
            portArray.push(newPort);
        }

        //console.log("succ singlePort");
    },


    generatePortInstance(portArray, portInstanceMap, portInstanceArray) {
        // 清空容器
        portInstanceArray.length = 0;
        portInstanceMap.clear();

        // 遍历所有端口
        for (const port of portArray) {
            // 为每个端口创建指定数量的实例
            for (let i = 0; i < port.instance_num; i++) {
                const new_instance = new MxPortInstance(portInstanceArray.length, port.name, "null", i, "null", "null");
                portInstanceArray.push(new_instance);

                // 使用字符串作为键（JavaScript Map不支持对象作为键）
                const key = `${port.name}_${i}`;
                portInstanceMap.set(key, new_instance);
            }
        }
    },




    /**
     * 从代码中分析dumpfileName
     * @param {string} code - 输入的代码字符串
     * @param {Map} portInstanceMap - 端口实例映射表
     */
    extractPortInstanceFileName(code, portInstanceMap) {
        // 正则表达式用于寻找所有形如 port_name[0] = new Port(128, "filename"); 的代码
        const multiPortRegex = /(\w+)\s*\[\s*(\d+)\s*\]\s*=\s*new\s*Port\s*\(\s*(\d+)\s*,\s*("[^"]*"(\s*\+\s*"[^"]*")*)\s*\)\s*;/g;
        let match;

        // 处理多端口实例声明
        while ((match = multiPortRegex.exec(code)) !== null) {
            const portName = match[1];
            const index = parseInt(match[2]);
            const searchKey = `${portName}_${index}`;

            if (!portInstanceMap.has(searchKey)) {
                console.log(`error in extractPortInstanceFileName(), port instance not declare: ${portName} ${index}`);
                continue;
            }

            const instance = portInstanceMap.get(searchKey);
            const dumpName = noSpaceString(calcStringEquation(match[4]));
            instance.dump_file_name = dumpName;
        }

        // 正则表达式用于寻找所有形如 port_name = new Port(128, "filename"); 的代码
        const singlePortRegex = /(\w+)\s*=\s*new\s*Port\s*\(\s*(\d+)\s*,\s*"([^"]*)"\s*\)\s*;/g;

        // 处理单端口实例声明
        while ((match = singlePortRegex.exec(code)) !== null) {
            const portName = match[1];
            const index = 0;
            const searchKey = `${portName}_${index}`;

            if (!portInstanceMap.has(searchKey)) {
                console.log(`error in extractPortInstanceFileName(), port instance not declare: ${portName} ${index}`);
                continue;
            }

            const instance = portInstanceMap.get(searchKey);
            const dumpName = calcStringEquation(match[3]);
            instance.dump_file_name = dumpName;
        }
    },


    /**
     * 在code中使用正则表达式提取ConnectPort相关代码，根据参数设置port的参数
     * @param {string} code - 输入的代码字符串
     * @param {Map} portInstanceMap - 端口实例映射表
     * @param {Map} moduleInstanceMap - 模块实例映射表
     */
    extractConnectInfo(code, portInstanceMap, moduleInstanceMap) {
        // 正则表达式用于匹配ConnectPort函数调用（3个参数）
        //const connectRegex3Param = /ConnectPort\(([^, |;]+),([^, |;]+),([^, |;]+)\)/g;
        const connectRegex3Param = /ConnectPort\(\s*([^,|;]+?)\s*,\s*([^,|;]+?)\s*,\s*([^)]+?)\s*\)/g;
        let match;

        // 处理3个参数的ConnectPort调用
        while ((match = connectRegex3Param.exec(code)) !== null) {
            const param1 = noSpaceString(match[1]);
            const portInstance = getPortInstanceInLastPart(param1, portInstanceMap);

            if (portInstance === null) {
                console.error(`error in extractConnectInfo, not find port instance of ${param1}`);
                continue;
            }

            const param2 = noSpaceString(match[2]);
            const param3 = noSpaceString(match[3]);
            //console.log('find ConnectPort() Multi', param2, param3);
            setOneEndOfPortInstance(portInstance, moduleInstanceMap, param2);
            setOneEndOfPortInstance(portInstance, moduleInstanceMap, param3);
        }

        // 正则表达式用于匹配ConnectPort函数调用（2个参数）
        // const connectRegex2Param = /ConnectPort\(([^, |;]+),([^, |;]+)\)/g;
        const connectRegex2Param = /ConnectPort\(\s*([^,]+?)\s*,\s*([^)]+?)\s*\)/g;
        // 处理2个参数的ConnectPort调用
        while ((match = connectRegex2Param.exec(code)) !== null) {
            const param1 = noSpaceString(match[1]);
            const portInstance = getPortInstanceInLastPart(param1, portInstanceMap);

            if (portInstance === null) {
                console.error(`error in extractConnectInfo, not find port instance of ${param1}`);
                continue;
            }

            const param2 = noSpaceString(match[2]);
            //console.log('find ConnectPort() Single', param2);
            setOneEndOfPortInstance(portInstance, moduleInstanceMap, param2);
        }

        //console.log("succ Connect Recognition");
    },






    printPorts(portArray) {
        console.log("Found ports:");
        portArray.forEach(port => {
            console.log(`ID: ${port.p_id}, Type: ${port.port_type}, Name: ${port.name}, Num: ${port.instance_num}`);
        });
    },

    printPortInstances(portInstanceArray) {
        console.log("Port Instances:");
        portInstanceArray.forEach(instance => {
            console.log(`Instance ID: ${instance.pi_id}, ` +
                `Port: ${instance.name}, ` +
                `Index: ${instance.index}, ` +
                `dump_file_name: ${instance.dump_file_name}, ` +
                `transmit_index: ${instance.transmit_index}, ` +
                `receive_index: ${instance.receive_index}, `);
        });
    },
}


export default CodeProcessFunc;
