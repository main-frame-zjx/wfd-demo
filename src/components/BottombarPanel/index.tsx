import React, { forwardRef,useRef,useEffect, useState, useContext, PropsWithChildren } from 'react';
import '../../iconfont.css';
import styles from "./index.less";
import { Tooltip } from "antd";
import 'antd/lib/tooltip/style';
import LangContext from "../../util/context";
import DumpAnalyseTool from "../../util/dumpAnalyse";


interface IProgressBarProps {
  percent: 88; // 当前进度值
  maxPercent?: number; // 最大百分比（进度）
  color?: string; // 进度值颜色
  showText?: "right"| "center" | "both"  // 标签显示在哪里：右边、中间
 
}

declare global{
  interface Window {
    UpdateMinMaxCycle: () => void;
  }
}


const BottombarPanel = forwardRef<any, PropsWithChildren<any>>((props,ref) => {
  const { i18n } = useContext(LangContext);
  const [textStyle, setTextStyle] = useState<string>("progressTextCenter");
  const newColor = "#d89c7a"; // 默认颜色

  const [percent, setPercent] = useState(0); // 当前进度值
  const [cycle_start, setcycle_start] = useState(0);
  const [cycle_end, setcycle_end] = useState(0);
  const [now, setNow] = React.useState(0);
  const progressBarRef = useRef<HTMLDivElement>(null); // 进度条容器的引用
  const isDragging = useRef(false); // 是否正在拖动
  const [isShow, setIsShow] = useState(false); // 是否显示进度条
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef(null);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    console.log('Mouse down');
    e.preventDefault(); // 防止默认行为
    isDragging.current = true; // 设置为拖动状态
    updateProgress(e); // 更新进度
  };

  const handleMouseMove = (e: MouseEvent) => {
    // console.log('Mouse moving');
    if (isDragging.current) {
      updateProgress(e);// 更新进度
    }
  };

  const handleMouseUp = () => {
    console.log('Mouse up');
    isDragging.current = false;// 停止拖动
  };

  const handlePlayClick = () => {
    if (isPlaying) {
        // 如果正在播放，清除定时器并将按钮文字改为播放
        clearInterval(intervalRef.current);
        setIsPlaying(false);
    } else {
        // 如果未播放，启动定时器并将按钮文字改为暂停
        intervalRef.current = setInterval(() => {
          setPercent((prevPercent) => {
              if (prevPercent < 100) {
                  const newPercent = prevPercent + 1;
                  setNow((prevNow) => prevNow + Math.floor((cycle_end - cycle_start) / 100));
                  if(now > cycle_end){
                    setNow(cycle_end);
                  }
                  console.log("newPercent:", newPercent)
                  console.log('now:', now);
                  return newPercent;
              } else {
                  setNow(cycle_end);
                  clearInterval(intervalRef.current);
                  setIsPlaying(false);
                  return prevPercent;
              }
          });
      }, 100); // 每 100 毫秒增加 1% 进度
        setIsPlaying(true);
    }
};

  const updateProgress = (e: React.MouseEvent<HTMLDivElement> | MouseEvent) => {
    if (!progressBarRef.current) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const x = 'clientX' in e ? e.clientX : (e as MouseEvent).clientX;
    const width = rect.width;
    console.log('width:', width);
    const newPercent = Math.min(100, Math.max(0, ((x - rect.left) / width) * 100));
    setPercent(newPercent);

    setNow(Math.floor((cycle_end-cycle_start)*newPercent/100)+cycle_start);
    // console.log('newPercent:', newPercent);
    // console.log('cycle_start:', cycle_start);
    // console.log('cal:', Math.floor((cycle_end-cycle_start)*newPercent/100)+cycle_start);
    // console.log('now2:', now);
  };

  useEffect(() => {
    console.log('Adding event listeners');
    console.log('now 更新后的值:', now);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      console.log('Removing event listeners');
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [now, percent]);

  const moveLeft = () => {
    if (percent > 0) {
        setPercent(percent - 1/(cycle_end-cycle_start));
        setNow(now - 1);
    }
  };

  const moveRight = () => {
      if (percent < 100) {
          setPercent(percent + 1/(cycle_end-cycle_start));
          setNow(now + 1);
      }
  };

  const UpdateMinMaxCycles = () => {
    setcycle_start(DumpAnalyseTool.getMinCycle());
    setcycle_end(DumpAnalyseTool.getMaxCycle());
    setNow(DumpAnalyseTool.getMinCycle());
    if(cycle_end!=0)setIsShow(true);
  }
  
  window.UpdateMinMaxCycle = UpdateMinMaxCycles;

  return (
    // style={{opacity: isShow ? 1 : 0}}
    <div>
      <div className={styles.bottombar} ref={ref}>
        <div className={styles.progressTextLeft}>{cycle_start}</div>
        <div className={styles.progressContainer} ref={progressBarRef} onMouseDown={handleMouseDown}>
          <div className={styles.progressBar} style={{ width: `${percent}%`, backgroundColor: newColor }}></div>
        </div>
        <div className={styles.progressTextCenter}>{now}/</div>
        <div className={styles.progressTextRight}>{cycle_end}</div>
      </div>
      <div className={styles.button}>
        {/* <button className={styles.leftButton} onClick={moveLeft}>向左</button> */}
        <button className={styles.icon_button} onClick={moveLeft}>
            <div className={styles.left_icon} />
        </button>
        <button className={styles.playButton} onClick={handlePlayClick}>
                {isPlaying ? '暂停' : '播放'}</button>
        <button className={styles.icon_button} onClick={moveRight}>
            <div className={styles.right_icon} />
        </button>
      </div>
      
    </div>
    
  );
});

export default BottombarPanel;