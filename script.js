var scannedIps = 0;
var ipsToScan = 0;

function checkPort(target, port, timeout) {

    let img = new Image();

    img.onerror = function() {
        if (!img) return;
        img = undefined;
        catchGood(target);
    };
    img.onload = img.onerror;
    var randomstring = Math.random().toString(36).slice(-8);
    img.src = 'http://' + target + ':' + port + '/' + randomstring + '.jpg';

    setTimeout(function() {
        if (++scannedIps >= ipsToScan) {
            var scanBtn = document.getElementById('scanBtn');
            scanBtn.disabled = false;
        }
        if (!img) {
            return;
        }
        img = undefined;
    }, timeout);
};

function int2ip(ipInt) {
    return ((ipInt >>> 24) + '.' + (ipInt >> 16 & 255) + '.' + (ipInt >> 8 & 255) + '.' + (ipInt & 255));
}

function ip2int(ip) {
    return ip
        .split('.')
        .reduce(function(ipInt, octet) {
            return (ipInt << 8) + parseInt(octet, 10)
        }, 0) >>> 0;
}

function mask2int(subnetMask) {
    return subnetMask
        .split('.')
        .reduce((c, o) => c - Math.log2(256 - +o), 32);
}

function getMask(maskSize) {
    var mask = 0;
    var i;
    for (i = 0; i < maskSize; i++) {
        mask += (1 << i) >>> 0;
    }
    return mask;
}

function startScan() {
    var scanBtn = document.getElementById('scanBtn');
    scanBtn.disabled = true;

    var ip = document.getElementById('localIp').value;
    var mask = document.getElementById('subnetMask').value;

    var ipNum = ip2int(ip);
    var prefixMask = ip2int(mask);
    var lowMask = getMask(32 - mask2int(mask));

    var ipLow = (ipNum & prefixMask) >>> 0;
    var ipHigh = (((ipNum & prefixMask) >>> 0) + lowMask) >>> 0;

    espList.innerHTML = '';

    ipsToScan = ipHigh - ipLow;
    scannedIps = 0;
    let i = ipLow;
    setTimeout(function run() {
        checkPort(int2ip(i), 80, 1000);
        if (i++ < ipHigh) {
            setTimeout(run, 20);
        }
    }, 100);
    /*
    for (let i = ipLow; i < ipHigh; i++) {
        checkPort(int2ip(i), 80, 1000);
    }*/

}

function catchGood(target) {
    var espList = document.getElementById('espList');
    espList.insertAdjacentHTML('beforeend', '<div><a href="http://' + target + '/" target="iframe"><p>' + target + '</p></a></div>');
}