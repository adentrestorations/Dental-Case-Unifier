function extractShades(rawText) {

    function isPossibleDate(parts) {
  if (!Array.isArray(parts) || parts.length !== 3) return false;

  const [month, day, year] = parts.map(p => parseInt(p, 10));

  // Check for valid numeric ranges
  if (
    Number.isNaN(month) || Number.isNaN(day) || Number.isNaN(year) ||
    month < 1 || month > 12 ||
    day < 1 || day > 31 ||
    year < 1000 || year > 9999
  ) {
    return false;
  }

  // Extra validation for day based on month/year
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

    function subShades(sh) {
        const validShades = ['-', '0M1', '1M1', '1M2', '2L1.5', '2L2.5', '2M1', '2M2', '2M3', '2R1.5', '2R2.5', '3L1.5', '3L2.5', '3M1', '3M2', '3M3', '3R1.5', '3R2.5', '4L1.5', '4L2.5', '4M1', '4M2', '4M3', '4R1.5', '4R2.5', '5M1', '5M2', '5M3', '440', 'O40', '110', 'A1', 'A2', 'A3', 'A3.5', 'A4', 'B1', 'B2', 'C1', 'C2', 'C3', 'C4', 'D1', 'D2', 'D3', 'D4', 'OM2']
         for (const shade of validShades) {
    if (sh.includes(shade)) {
      return shade;
    }
  }

  // If nothing matched, keep original or fallback
  return sh;
    }
  const lines = rawText.split(/\r?\n/); // split into lines (Windows/Unix safe)

  for (const line of lines) {
    const firstSlash = line.indexOf('/');
    const secondSlash = line.indexOf('/', firstSlash + 1);

    // Check if two slashes exist and skip unwanted patterns
    if (
      firstSlash !== -1 &&
      secondSlash !== -1 &&
      !(line.includes('/Body')) &&
      !(line.includes('/Gi'))
    ) {
      // Text between slashes → shade2
      let shade2 = line.slice(firstSlash + 1, secondSlash);

      // Text after second slash until space/newline → shade3
      const afterSecond = line.slice(secondSlash + 1);
      let stopIndex = afterSecond.search(/[\s\n]/);
      if (stopIndex === -1) stopIndex = afterSecond.length;
      let shade3 = afterSecond.slice(0, stopIndex);

      // Text before first slash until space or dash → shade1
      let startIndex = firstSlash - 1;
      while (startIndex >= 0 && line[startIndex] !== ' ' && line[startIndex] !== '-') {
        startIndex--;
      }
      let shade1 = line.slice(startIndex + 1, firstSlash);

       if (shade1.trim() === '') {
        shade1 = '-';
      }

      let currentShades = [subShades(shade1), shade2, shade3]

      if (!(isPossibleDate(currentShades))) {
        return currentShades;
      }
    }
  }

  // If nothing matched
  return ['-', '-', '-'];
}

module.exports = extractShades;
