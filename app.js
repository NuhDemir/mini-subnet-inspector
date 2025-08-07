const readline = require("readline");
const ip = require("ip");
const chalk = require("chalk");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let arpTable = {
  "192.168.1.1": "00:00:00:00:00:01", // gerçek gateway
};

let myIP = "192.168.1.3";
let myCIDR = "192.168.1.0/24";
let gatewayIP = "192.168.1.1";

function isSameSubnet(ip1, subnet) {
  return ip.cidrSubnet(subnet).contains(ip1);
}

function askTargetIP() {
  rl.question(chalk.cyan("\n🎯 Hedef IP adresini gir: "), (targetIP) => {
    if (!ip.isV4Format(targetIP)) {
      console.log(chalk.red("⛔ Geçersiz IP formatı."));
      return askTargetIP();
    }

    if (isSameSubnet(targetIP, myCIDR)) {
      console.log(chalk.green(`✅ ${targetIP} aynı subnet'te. Direkt erişiliyor.`));
    } else {
      console.log(chalk.yellow(`🚀 ${targetIP} farklı subnet'te. Gateway'e yönlendiriliyor...`));

      if (arpTable[gatewayIP] !== "00:00:00:00:00:01") {
        console.log(chalk.red("⚠️ Uyarı! Gateway sahte olabilir!"));
        console.log(`💀 Sahte MAC: ${arpTable[gatewayIP]}`);
      }
    }

    askNext();
  });
}

function askNext() {
  rl.question(chalk.magenta("\n👉 Devam mı? (y/n/s for spoof): "), (answer) => {
    if (answer === "y") {
      askTargetIP();
    } else if (answer === "s") {
      spoofGateway();
    } else {
      rl.close();
    }
  });
}

function spoofGateway() {
  rl.question(chalk.red("💀 Sahte MAC adresi gir (örn: aa:bb:cc:dd:ee:ff): "), (mac) => {
    arpTable[gatewayIP] = mac;
    console.log(chalk.red("⚠️ Gateway artık sahte! ARP tablosu güncellendi."));
    askTargetIP();
  });
}

console.log(chalk.bold("\n📡 Mini Subnet + Gateway Simülatörü"));
console.log(`\n🖥️  IP: ${myIP}`);
console.log(`🌐 Subnet: ${myCIDR}`);
console.log(`🚪 Gateway: ${gatewayIP}`);

askTargetIP();
