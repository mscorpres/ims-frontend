import React, { useRef, useEffect, useCallback, useState } from "react";
import { Input, Button, Space } from "antd";
import { ReloadOutlined } from "@ant-design/icons";

const ALPHABETS = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // Exclude I,O for clarity
const LENGTH = 5;

const generateCode = () => {
  let code = "";
  for (let i = 0; i < LENGTH; i++) {
    code += ALPHABETS[Math.floor(Math.random() * ALPHABETS.length)];
  }
  return code;
};

const drawCaptcha = (canvasRef, code) => {
  if (!canvasRef?.current || !code) return;
  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const width = 180;
  const height = 56;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.scale(dpr, dpr);

  // Background
  ctx.fillStyle = "#f0f2f5";
  ctx.fillRect(0, 0, width, height);

  // Noise lines
  for (let i = 0; i < 4; i++) {
    ctx.strokeStyle = `rgba(${80 + Math.random() * 80},${80 + Math.random() * 80},${80 + Math.random() * 80},0.5)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(Math.random() * width, Math.random() * height);
    ctx.lineTo(Math.random() * width, Math.random() * height);
    ctx.stroke();
  }

  // Noise dots
  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = `rgba(${100 + Math.random() * 100},${100 + Math.random() * 100},${100 + Math.random() * 100},0.4)`;
    ctx.fillRect(Math.random() * width, Math.random() * height, 2, 2);
  }

  // Draw each letter with slight rotation and offset
  const letterWidth = width / (code.length + 1);
  ctx.font = "bold 24px Arial";
  code.split("").forEach((char, i) => {
    ctx.save();
    const x = letterWidth * (i + 0.6) + (Math.random() * 8 - 4);
    const y = 28 + (Math.random() * 8 - 4);
    ctx.translate(x, y);
    ctx.rotate((Math.random() * 0.4 - 0.2));
    ctx.fillStyle = `rgb(${30 + Math.random() * 60},${30 + Math.random() * 60},${30 + Math.random() * 60})`;
    ctx.fillText(char, 0, 0);
    ctx.restore();
  });
};

/**
 * Client-side image captcha (no backend, no third party).
 * Renders random letters on a canvas; user types what they see.
 * @param {string} value - Controlled input value
 * @param {function} onChange - (e) => setValue(e.target.value)
 * @param {function} onCodeChange - (code) => setExpectedCode(code) so parent can validate
 * @param {function} onRefresh - Called when refresh icon is clicked (optional)
 * @param {boolean} caseSensitive - If false, comparison is case-insensitive (default: false)
 */
const ImageCaptcha = ({
  value = "",
  onChange,
  onCodeChange,
  onRefresh,
  caseSensitive = false,
  placeholder = "Enter text shown above",
  inputStyle,
  ...rest
}) => {
  const canvasRef = useRef(null);
  const [code, setCode] = useState(() => generateCode());

  const refresh = useCallback(() => {
    const newCode = generateCode();
    setCode(newCode);
    drawCaptcha(canvasRef, newCode);
    onCodeChange?.(newCode);
    onRefresh?.();
  }, [onCodeChange, onRefresh]);

  useEffect(() => {
    drawCaptcha(canvasRef, code);
  }, [code]);

  useEffect(() => {
    onCodeChange?.(code);
  }, [code, onCodeChange]);

  return (
    <Space direction="vertical" size="small" style={{ width: "100%" }}>
      <Space align="center">
        <canvas
          ref={canvasRef}
          style={{
            border: "1px solid #d9d9d9",
            borderRadius: 4,
            display: "block",
          }}
        />
        <Button
          type="text"
          icon={<ReloadOutlined />}
          onClick={refresh}
          title="Refresh captcha"
        />
      </Space>
      <Input
        value={value}
        size="large"
        onChange={onChange}
        placeholder={placeholder}
        maxLength={LENGTH}
        autoComplete="off"
        style={{ width: 180, ...inputStyle }}
        {...rest}
      />
    </Space>
  );
};

export default ImageCaptcha;
export { generateCode, drawCaptcha, LENGTH as CAPTCHA_LENGTH };
