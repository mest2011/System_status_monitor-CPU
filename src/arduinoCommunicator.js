const SerialPort = require("serialport");
const Readline = SerialPort.parsers.Readline;
const port = new SerialPort("COM10", {
  baudRate: 9600,
});
const parser = new Readline();
const si = require("systeminformation");
port.pipe(parser);
parser.on("data", console.log);

function write() {
  port.on("data", async function (data) {
    let cpuUsage = parseInt(
      await si.currentLoad().then((data) => {
        return data.currentLoad;
      })
    );
    let bateryPercent = await si.battery().then((data) => {
      return data.percent;
    });

    if (cpuUsage) {
      port.write(
        `CPU Usage: ${cpuUsage < 10 ? "0" + cpuUsage : cpuUsage}% Batery: ${
          bateryPercent < 10 ? "0" + bateryPercent : bateryPercent
        }%   `
      );
    }
  });
}

port.on("open", function () {
  write();
});
