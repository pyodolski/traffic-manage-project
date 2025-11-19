const express = require("express");
const router = express.Router();
const os = require("os");
const osUtils = require("os-utils");

// 시스템 모니터링 정보
router.get("/system", (req, res) => {
  osUtils.cpuUsage((cpuPercent) => {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    res.json({
      cpu: {
        usage: (cpuPercent * 100).toFixed(2),
        cores: os.cpus().length,
        model: os.cpus()[0].model,
      },
      memory: {
        total: (totalMem / 1024 / 1024 / 1024).toFixed(2),
        used: (usedMem / 1024 / 1024 / 1024).toFixed(2),
        free: (freeMem / 1024 / 1024 / 1024).toFixed(2),
        usagePercent: ((usedMem / totalMem) * 100).toFixed(2),
      },
      system: {
        platform: os.platform(),
        hostname: os.hostname(),
        uptime: Math.floor(os.uptime() / 60),
      },
    });
  });
});

module.exports = router;
