const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDir(fullPath);
    } else if (file.endsWith('.js') || file.endsWith('.html') || file.endsWith('.txt')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;

      if (content.includes('web-tipes')) {
        content = content.replace(/\/web-tipes\/web-tipes\/web-tipes\//g, '/IT-Fest/');
        content = content.replace(/\/web-tipes\/web-tipes\//g, '/IT-Fest/');
        content = content.replace(/\/web-tipes\//g, '/IT-Fest/');
        content = content.replace(/\/web-tipes/g, '/IT-Fest');
        modified = true;
      }

      if (file.endsWith('.html') && content.includes('self.__next_f')) {
        const newContent = content.replace(/<script>(self\.__next_f[\s\S]*?)<\/script>/g, (match, p1) => {
          return '<script>' + p1.replace(/\r?\n/g, '\\n') + '</script>';
        });
        if (newContent !== content) {
          content = newContent;
          modified = true;
        }
      }

      if (content.includes('https://forms.google.com/')) {
        content = content.replace(/id:"ml"([^}]*?)gformUrl:"https:\/\/forms\.google\.com\/"/g, 'id:"ml"$1gformUrl:"https://bit.ly/PendaftaranLombaMobileLegendsITFestival2026"');
        content = content.replace(/id:"ff"([^}]*?)gformUrl:"https:\/\/forms\.google\.com\/"/g, 'id:"ff"$1gformUrl:"https://bit.ly/PendaftaranLombaFreeFireITFestival2026"');
        content = content.replace(/id:"vibe-coding-comp"([^}]*?)gformUrl:"https:\/\/forms\.google\.com\/"/g, 'id:"vibe-coding-comp"$1gformUrl:"https://bit.ly/PendaftaranLombaVibeCodingITFestival2026"');
        content = content.replace(/id:"ctf-comp"([^}]*?)gformUrl:"https:\/\/forms\.google\.com\/"/g, 'id:"ctf-comp"$1gformUrl:"https://bit.ly/PendaftranLombaCaptureTheFlagITFestival2026"');
        content = content.replace(/id:"photography-comp"([^}]*?)gformUrl:"https:\/\/forms\.google\.com\/"/g, 'id:"photography-comp"$1gformUrl:"https://bit.ly/PendaftaranLombaPromtographyITFestival2026"');
        content = content.replace(/id:"vibe-coding-training"([^}]*?)gformUrl:"https:\/\/forms\.google\.com\/"/g, 'id:"vibe-coding-training"$1gformUrl:"http://bit.ly/PendaftaranPelatihanVibeCodingITFestival2026"');
        content = content.replace(/id:"cyber-security-training"([^}]*?)gformUrl:"https:\/\/forms\.google\.com\/"/g, 'id:"cyber-security-training"$1gformUrl:"https://bit.ly/PendaftaranPelatihanCybersecurityITFestival2026"');
        content = content.replace(/id:"seminar-itfest"([^}]*?)gformUrl:"https:\/\/forms\.google\.com\/"/g, 'id:"seminar-itfest"$1gformUrl:"https://bit.ly/PendaftaranSeminarITFestival2026"');
        content = content.replace(/gformUrl:"https:\/\/forms\.google\.com\/"/g, 'gformUrl:"https://bit.ly/PendaftaranSeminarITFestival2026"');
        modified = true;
      }

      if (modified) {
        console.log('Fixing file:', fullPath);
        fs.writeFileSync(fullPath, content, 'utf8');
      }
    }
  }
}

const deployDir = path.join(__dirname, '..', 'deploy-cpanel');
console.log('Cleaning deploy-cpanel directory:', deployDir);
processDir(deployDir);
console.log('Done cleaning deploy-cpanel bundle!');

