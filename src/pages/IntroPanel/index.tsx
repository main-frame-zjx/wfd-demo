// src/pages/IntroPanel/index.tsx
import React, { useState, useEffect } from 'react';
import { useHistory, withRouter } from 'react-router-dom';
import { Button, Select, Spin, Typography } from 'antd';
import Markdown from 'markdown-to-jsx';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { RouteComponentProps } from 'react-router-dom';
import { Collapse, Modal, Input, message } from "antd";
import GlobalEnv from "../../util/globalEnv.js";
const { Option } = Select;
const { Paragraph, Title } = Typography;

// 本地开发时访问路径（基于webpack-dev-server）
const DEV_BASE = GlobalEnv['api'];

const DOC_MAP = {
    intro: `${DEV_BASE}/getString/intro`, // 完整物理路径
    tech: `${DEV_BASE}/getString/tech-doc`
};

const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => (
    <Markdown
        options={{
            overrides: {
                h1: { component: Title, props: { level: 1 } },
                h2: { component: Title, props: { level: 2 } },
                p: { component: Paragraph },
                code: ({ children }) => (
                    <pre style={{
                        background: '#f6f8fa',
                        padding: '12px',
                        borderRadius: '4px'
                    }}>
                        <code>{children}</code>
                    </pre>
                )
            }
        }}
    >
        {content}
    </Markdown>
);

interface IntroPanelProps extends RouteComponentProps { }

export const IntroPanel: React.FC<IntroPanelProps> = () => {
    const [content, setContent] = useState('');
    const [docType, setDocType] = useState<'intro' | 'tech'>('intro');
    const [loading, setLoading] = useState(false);
    const history = useHistory();

    useEffect(() => {
        const controller = new AbortController();

        const fetchMarkdown = async () => {
            try {

                setLoading(true);
                const response = await fetch(`${DOC_MAP[docType]}?token=${localStorage.getItem('token')}`);

                if (!response.ok) {
                    if (response.status === 401) {
                        console.log('身份过期');
                        localStorage.removeItem('token');

                        // 阻止后续操作（关键！）
                        throw new Error('身份过期，请重新登录');
                    }
                    throw new Error(`HTTP错误: ${response.status}`);
                }

                const jsonData = await response.json();

                if (jsonData.error) {
                    throw new Error(jsonData.error);
                }

                setContent(jsonData.text);

                console.log('文档加载成功');
                //console.log(jsonData.text);
            } catch (error) {
                if (!controller.signal.aborted) {
                    console.error('文档加载失败:', error);
                }
                if (error.response && error.response.status === 401) {
                    console.log('身份过期'); // 在接口调用处明确打印
                    message.warning('登录状态已过期，请重新登录');
                    // alert("身份过期!");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchMarkdown();
        return () => controller.abort();
    }, [docType]);

    return (
        <div style={{ padding: 20 }}>
            <div style={{ marginBottom: 20, display: 'flex', gap: 16 }}>
                <Button
                    type="primary"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => history.push('/')}
                >
                    返回首页
                </Button>

                <Select
                    value={docType}
                    onChange={setDocType}
                    style={{ width: 200 }}
                >
                    <Option value="intro">介绍文档</Option>
                    <Option value="tech">技术文档</Option>
                </Select>
            </div>

            <Spin spinning={loading}>
                <div style={{
                    background: '#fff',
                    padding: 24,
                    borderRadius: 8,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    <MarkdownRenderer content={content} />
                </div>
            </Spin>
        </div>
    );
};


//export default withRouter(IntroPanel);