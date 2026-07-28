-- 嵌入式详细规划单：分类 + 技能（一键插入）
-- 在 Supabase SQL Editor 中执行；若已存在同名分类则跳过该分类，避免重复

DO $$
DECLARE
  tid UUID;
BEGIN
  -- 1. C 语言基础
  IF NOT EXISTS (SELECT 1 FROM embedded_tree WHERE category = 'C 语言基础') THEN
    INSERT INTO embedded_tree (category, icon, sort_order) VALUES ('C 语言基础', '◆', 1) RETURNING id INTO tid;
    INSERT INTO embedded_skills (embedded_tree_id, skill, sort_order) VALUES
      (tid, '指针、内存、位运算', 1),
      (tid, '结构体、枚举、宏', 2),
      (tid, '模块化与头文件', 3),
      (tid, '常用库：stdio、string、stdint', 4);
  END IF;

  -- 2. 单片机 / 开发板入门
  IF NOT EXISTS (SELECT 1 FROM embedded_tree WHERE category = '单片机 / 开发板入门') THEN
    INSERT INTO embedded_tree (category, icon, sort_order) VALUES ('单片机 / 开发板入门', '■', 2) RETURNING id INTO tid;
    INSERT INTO embedded_skills (embedded_tree_id, skill, sort_order) VALUES
      (tid, '选型：STM32 / 51 / ESP32 / 树莓派 Pico 等', 1),
      (tid, '开发环境：Keil / STM32CubeIDE / VS Code + 插件', 2),
      (tid, '烧录与调试：JTAG/SWD、串口', 3),
      (tid, '最小系统与时钟树', 4);
  END IF;

  -- 3. 外设与底层
  IF NOT EXISTS (SELECT 1 FROM embedded_tree WHERE category = '外设与底层') THEN
    INSERT INTO embedded_tree (category, icon, sort_order) VALUES ('外设与底层', '▲', 3) RETURNING id INTO tid;
    INSERT INTO embedded_skills (embedded_tree_id, skill, sort_order) VALUES
      (tid, '寄存器、GPIO 输入输出', 1),
      (tid, '定时器（TIM）：PWM、输入捕获、基本定时', 2),
      (tid, '中断：NVIC、外部中断、优先级', 3),
      (tid, '串口 UART：收发、printf 重定向', 4),
      (tid, 'ADC/DAC 入门', 5);
  END IF;

  -- 4. RTOS
  IF NOT EXISTS (SELECT 1 FROM embedded_tree WHERE category = 'RTOS') THEN
    INSERT INTO embedded_tree (category, icon, sort_order) VALUES ('RTOS', '●', 4) RETURNING id INTO tid;
    INSERT INTO embedded_skills (embedded_tree_id, skill, sort_order) VALUES
      (tid, '任务、调度、优先级', 1),
      (tid, '信号量、互斥量、消息队列', 2),
      (tid, 'FreeRTOS / μC/OS 入门', 3),
      (tid, '任务划分与栈大小', 4);
  END IF;

  -- 5. 通信协议
  IF NOT EXISTS (SELECT 1 FROM embedded_tree WHERE category = '通信协议') THEN
    INSERT INTO embedded_tree (category, icon, sort_order) VALUES ('通信协议', '◇', 5) RETURNING id INTO tid;
    INSERT INTO embedded_skills (embedded_tree_id, skill, sort_order) VALUES
      (tid, 'UART、I2C、SPI 原理与驱动', 1),
      (tid, 'CAN 总线（可选）', 2),
      (tid, '1-Wire、Modbus 等（按需）', 3),
      (tid, '调试：逻辑分析仪、示波器', 4);
  END IF;

  -- 6. 传感器与驱动
  IF NOT EXISTS (SELECT 1 FROM embedded_tree WHERE category = '传感器与驱动') THEN
    INSERT INTO embedded_tree (category, icon, sort_order) VALUES ('传感器与驱动', '◐', 6) RETURNING id INTO tid;
    INSERT INTO embedded_skills (embedded_tree_id, skill, sort_order) VALUES
      (tid, '常见传感器：温湿度、光照、加速度、超声波', 1),
      (tid, '驱动封装：初始化、读值、滤波', 2),
      (tid, '显示屏：OLED、LCD、TFT（按需）', 3),
      (tid, '电机与舵机控制入门', 4);
  END IF;

  -- 7. 小项目实践
  IF NOT EXISTS (SELECT 1 FROM embedded_tree WHERE category = '小项目实践') THEN
    INSERT INTO embedded_tree (category, icon, sort_order) VALUES ('小项目实践', '▣', 7) RETURNING id INTO tid;
    INSERT INTO embedded_skills (embedded_tree_id, skill, sort_order) VALUES
      (tid, '智能小车：循迹、避障、遥控', 1),
      (tid, '数据采集：多路 ADC、存储、上位机', 2),
      (tid, '简单 IoT：Wi-Fi/蓝牙上报、云端展示', 3),
      (tid, '小工具：闹钟、环境监测、遥控器', 4);
  END IF;

  -- 8. 软硬结合与规范
  IF NOT EXISTS (SELECT 1 FROM embedded_tree WHERE category = '软硬结合与规范') THEN
    INSERT INTO embedded_tree (category, icon, sort_order) VALUES ('软硬结合与规范', '§', 8) RETURNING id INTO tid;
    INSERT INTO embedded_skills (embedded_tree_id, skill, sort_order) VALUES
      (tid, '原理图与 PCB 入门（立创 EDA / KiCad）', 1),
      (tid, '代码规范与注释', 2),
      (tid, '版本管理、文档与复盘', 3),
      (tid, '功耗与可靠性简单考虑', 4);
  END IF;
END $$;
