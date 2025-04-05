// src/app/utils/matchParser.js
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

async function getTodayMatches() {
  try {
    const filePath = path.join(process.cwd(),'ipl-schedule.csv');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    const data = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    });
    
    const today = new Date();
    const todayFormatted = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
    console.log("Today formatted:", todayFormatted); // 5/4/2025

    const todayMatches = data.filter(match => {
    const dateParts = match.Date.split('/');
    const matchDate = new Date(
        parseInt(dateParts[2]), // Year
        parseInt(dateParts[1]) - 1, // Month (0-indexed in JS)
        parseInt(dateParts[0]) // Day
    );
    
    const matchDateFormatted = `${matchDate.getDate()}/${matchDate.getMonth() + 1}/${matchDate.getFullYear()}`;
    
    
    return matchDateFormatted === todayFormatted;
    });
    // Limit to maximum 2 matches
    console.log(todayMatches)
    return todayMatches.slice(0, 2);
  } catch (error) {
    console.error('Error getting today\'s matches:', error);
    return [];
  }
}

module.exports = { getTodayMatches };