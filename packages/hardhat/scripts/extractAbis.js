const fs = require('fs');
const path = require('path');

const contracts = ['ENSRoyaltyManager', 'RoyaltyNameWrapper', 'RoyaltyPaymentSplitter', 'SubdomainFactory'];

contracts.forEach(name => {
  const deploymentPath = path.join(__dirname, '..', 'deployments', 'sepolia', `${name}.json`);
  const data = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  
  const abiDir = path.join(__dirname, '..', '..', 'frontend', 'lib', 'abis');
  fs.mkdirSync(abiDir, { recursive: true });
  
  fs.writeFileSync(
    path.join(abiDir, `${name}.json`),
    JSON.stringify(data.abi, null, 2)
  );
  
  console.log(`✓ Extracted ABI for ${name}`);
});

console.log('\n✅ All ABIs extracted successfully!');
