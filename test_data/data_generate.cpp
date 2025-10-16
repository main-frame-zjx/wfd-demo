#include <bits/stdc++.h>
using namespace std;

#define _for(i, a, b) for (int i = (a); i < (b); ++i)

long long rd()
{
	return rand() | (rand() << 15);
}

int module_num = 10;
int pi_num = 0;
string module_name[10] = {"gia", "vsd", "hsd", "gtf", "dsd", "gsd", "lsd", "pai", "gff", "gfd"};
int module_instance_num[10] = {4, 4, 4, 4, 4, 4, 4, 4, 4, 1};
int mi_start[10] = {0};

string code_path = "./generate_code/case5/";
string dump_path = "./generate_dump/case5_20M/";
int cycle_max = 1000; // 对应20M
// int cycle_max = 350000; // 对应1GB

int port_num[10][10];

int init_port_num_array()
{
	_for(i, 0, module_num)
	{
		_for(j, 0, module_num)
		{
			port_num[i][j] = 0;
		}
	}

	port_num[0][1] = 1, port_num[1][0] = 1;
	port_num[0][8] = 1, port_num[8][0] = 1;
	port_num[0][9] = 1, port_num[9][0] = 1;
	port_num[1][2] = 1, port_num[2][1] = 1;
	port_num[1][4] = 1, port_num[4][1] = 1;
	port_num[1][5] = 1, port_num[5][1] = 1;
	port_num[1][6] = 1, port_num[6][1] = 1;
	port_num[1][7] = 1, port_num[7][1] = 1;
	port_num[2][3] = 1, port_num[3][2] = 1;
	port_num[2][4] = 1, port_num[4][2] = 1;
	port_num[3][4] = 1, port_num[4][3] = 1;
	port_num[3][8] = 1, port_num[8][3] = 1;
	port_num[4][5] = 1, port_num[5][4] = 1;
	port_num[4][7] = 1, port_num[7][4] = 1;
	port_num[5][6] = 1, port_num[6][5] = 1;
	port_num[6][7] = 1, port_num[7][6] = 1;
	port_num[6][7] = 1, port_num[7][6] = 1;

	int total_pi_num = 0;

	_for(i, 0, module_num)
	{
		_for(j, 0, module_num)
		{
			if (port_num[i][j] > 0)
				port_num[i][j] = rand() % 3 + 1;
			total_pi_num += port_num[i][j] * 4;
		}
	}
	return total_pi_num;
}

string port_ins_name(int i, int j, int dpc, int id)
{
	return module_name[i] + (string) "_" + module_name[j] +
		   (string) "_draw_id" + to_string(id) +
		   "[" + to_string(dpc) + "]";
}

string port_ins_name(int i, int j, string dpc, int id)
{
	return module_name[i] + (string) "_" + module_name[j] +
		   (string) "_draw_id" + to_string(id) +
		   "[" + dpc + "]";
}

string dump_file_name(int i, int j, int dpc, int id)
{
	return (string) "dpc" + to_string(dpc) + (string) "_" +
		   module_name[i] + (string) "_" + module_name[j] +
		   (string) "_draw_id" + to_string(id) + ".model_vec";
}

string dump_file_name(int i, int j, int id)
{
	return (string) "_" +
		   module_name[i] + (string) "_" + module_name[j] +
		   (string) "_draw_id" + to_string(id) + ".model_vec";
}

void print_dump_record(int cycle_id)
{
	cout << "1 1 0 0 00010000_000088e8_41950000_00010077 0 0 @ " << setw(10) << setfill('0') << cycle_id << endl;
}

string module_name_i(int module_id)
{
	string ans = module_name[module_id];
	if (module_instance_num[module_id] == 1)
		return ans;
	else
		return ans + (string) "[i]";
}

void printTestCodeTxt()
{
	// first file: test_code.txt
	freopen((code_path + (string) "test_code.txt").data(), "w", stdout);
	cout << module_num << endl;
	int module_ins_sum = 0;

	_for(i, 0, module_num)
	{
		cout << i << " " << module_name[i] << " " << module_instance_num[i] << " ";
		if (module_instance_num[i] == 1)
			cout << "Single" << endl;
		else
			cout << "Multi" << endl;
		mi_start[i] = module_ins_sum;
		module_ins_sum += module_instance_num[i];
	}

	cout << module_ins_sum << endl;
	for (int i = 0, ins_idx = 0; i < module_num; i++)
	{
		_for(j, 0, module_instance_num[i])
		{
			cout << ins_idx << " " << i << " " << module_name[i] << " " << j << endl;
			ins_idx++;
		}
	}

	pi_num = init_port_num_array();
	cout << pi_num << endl;
	int pi_idx = 0;
	_for(i, 0, module_num)
	{
		_for(j, 0, module_num)
		{
			if (port_num[i][j] == 0)
				continue;
			_for(k, 0, port_num[i][j])
			{
				int stepi = module_instance_num[i] == 1 ? 0 : 1;
				int stepj = module_instance_num[j] == 1 ? 0 : 1;
				cout << pi_idx + 0 << " " << port_ins_name(i, j, 0, k) << " " << dump_file_name(i, j, 0, k)
					 << " " << mi_start[i] + 0 * stepi << " " << mi_start[j] + 0 * stepj << endl;
				cout << pi_idx + 1 << " " << port_ins_name(i, j, 1, k) << " " << dump_file_name(i, j, 1, k)
					 << " " << mi_start[i] + 1 * stepi << " " << mi_start[j] + 1 * stepj << endl;
				cout << pi_idx + 2 << " " << port_ins_name(i, j, 2, k) << " " << dump_file_name(i, j, 2, k)
					 << " " << mi_start[i] + 2 * stepi << " " << mi_start[j] + 2 * stepj << endl;
				cout << pi_idx + 3 << " " << port_ins_name(i, j, 3, k) << " " << dump_file_name(i, j, 3, k)
					 << " " << mi_start[i] + 3 * stepi << " " << mi_start[j] + 3 * stepj << endl;
				pi_idx += 4;
			}
		}
	}

	// cout << port_num[9][0];

	fclose(stdout);
}

void printTestCodeCpp()
{
	// next file: test_code.cpp
	freopen((code_path + (string) "test_code.cpp").data(), "w", stdout);
	_for(i, 0, module_num)
	{
		cout << "CGfdBlock *" << module_name[i];
		if (module_instance_num[i] == 1)
			cout << ";" << endl;
		else
			cout << "[" << module_instance_num[i] << "]" << ";" << endl;
	}

	_for(i, 0, module_num)
	{
		_for(j, 0, module_num)
		{
			if (port_num[i][j] == 0)
				continue;
			_for(k, 0, port_num[i][j])
			{
				int stepi = module_instance_num[i] == 1 ? 0 : 1;
				int stepj = module_instance_num[j] == 1 ? 0 : 1;
				cout << "Port *" << port_ins_name(i, j, 4, k) << " = {nullptr};" << endl;
			}
		}
	}
	cout << "for (int i = 0; i < 4; i++){" << endl;
	_for(i, 0, module_num)
	{
		_for(j, 0, module_num)
		{
			if (port_num[i][j] == 0)
				continue;
			_for(k, 0, port_num[i][j])
			{
				int stepi = module_instance_num[i] == 1 ? 0 : 1;
				int stepj = module_instance_num[j] == 1 ? 0 : 1;
				cout << "Xgf_ptr_obj." << port_ins_name(i, j, string("i"), k) << " = new Port(128, \"dpc\" + to_string(i) + \"" << dump_file_name(i, j, k) << "\");" << endl;
			}
		}
	}

	cout << "}" << endl;

	cout << "for (int i = 0; i < 4; i++){" << endl;
	_for(i, 0, module_num)
	{
		_for(j, 0, module_num)
		{
			if (port_num[i][j] == 0)
				continue;
			_for(k, 0, port_num[i][j])
			{
				int stepi = module_instance_num[i] == 1 ? 0 : 1;
				int stepj = module_instance_num[j] == 1 ? 0 : 1;
				cout << "ptr_obj->pGfdBlock->ConnectPort(ptr_obj->" << port_ins_name(i, j, string("i"), k) << "," << endl
					 << "ptr_obj->" << module_name_i(i) << "->GFD_GFP_draw_cmd_Tx[i]," << endl
					 << "ptr_obj->" << module_name_i(j) << "->GFD_GFP_draw_cmd_Rx);" << endl;
			}
		}
	}

	cout << "}" << endl;
	fclose(stdout);
}

void printDumpFile()
{
	_for(i, 0, module_num)
	{
		_for(j, 0, module_num)
		{
			if (port_num[i][j] == 0)
				continue;
			_for(k, 0, port_num[i][j])
			{
				_for(dpc, 0, 4)
				{
					freopen((dump_path + dump_file_name(i, j, dpc, k)).data(), "w", stdout);
					cout << "class xgfss_" << module_name[i] << "_" << module_name[j] << endl;
					cout << "endclass" << endl;

					int data_seed_max = 50;
					if (rand() % 50 == 0)
						data_seed_max = 1;

					int current_cycle = 0;
					while (current_cycle < cycle_max)
					{
						current_cycle += rand() % 10 + 10;
						int width = rand() % 100 + 100;
						int data_seed = rand() % data_seed_max;
						if (data_seed == 0)
						{
							// 拥挤数据传输
							_for(c_id, current_cycle, current_cycle + width)
								print_dump_record(c_id);
						}
						else if (data_seed < 20)
						{
							// 零散数据传输
							_for(c_id, current_cycle, current_cycle + width)
							{
								if (rand() % 2 == 0)
									print_dump_record(c_id);
							}
						}
						else
						{
							// 无数据传输
						}
						current_cycle += width;
					}

					fclose(stdout);
				}
			}
		}
	}
}

int main()
{
	srand(10086);
	printTestCodeTxt();
	printTestCodeCpp();
	printDumpFile();
}
