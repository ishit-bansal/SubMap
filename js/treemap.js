/**
 * Squarified Treemap Layout Algorithm
 * Based on: Bruls, Huizing, van Wijk (2000)
 * https://www.win.tue.nl/~vanwijk/stm.pdf
 * 
 * The algorithm divides a rectangle into smaller rectangles
 * with areas proportional to input values, optimizing for
 * aspect ratios close to 1 (making cells as square as possible)
 */

class Treemap {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.cellGap = 4; // Gap between cells in pixels
  }

  /**
   * Main entry point - takes items with 'val' property
   * Returns array of rectangles with x, y, w, h coordinates
   */
  layout(items) {
    if (items.length === 0) return [];

    // Calculate total value for proportional sizing
    const total = items.reduce((sum, item) => sum + item.val, 0);
    const totalArea = this.width * this.height;

    // Normalize items to include their target area
    const normalized = items.map(item => ({
      ...item,
      area: (item.val / total) * totalArea
    }));

    const rectangles = [];
    this._squarify(normalized, [], 0, 0, this.width, this.height, rectangles);
    return rectangles;
  }

  /**
   * Recursive squarification - tries to make cells as square as possible
   * by comparing aspect ratios when adding items to the current row
   */
  _squarify(remaining, currentRow, x, y, w, h, output) {
    if (remaining.length === 0) {
      this._layoutRow(currentRow, x, y, w, h, output);
      return;
    }

    const next = remaining[0];
    const withNext = currentRow.concat([next]);

    // Add to current row if it improves (or maintains) aspect ratio
    if (currentRow.length === 0 || this._worstRatio(currentRow, w, h) >= this._worstRatio(withNext, w, h)) {
      this._squarify(remaining.slice(1), withNext, x, y, w, h, output);
    } else {
      // Start new row
      const bounds = this._layoutRow(currentRow, x, y, w, h, output);
      this._squarify(remaining, [], bounds.nx, bounds.ny, bounds.nw, bounds.nh, output);
    }
  }

  /**
   * Calculate worst aspect ratio in a row
   * Lower is better (closer to 1 = more square)
   */
  _worstRatio(row, w, h) {
    if (row.length === 0) return Infinity;

    const areaSum = row.reduce((sum, item) => sum + item.area, 0);
    const shortSide = Math.min(w, h);
    const rowThickness = areaSum / shortSide;

    let worstRatio = 0;
    for (const item of row) {
      const itemLength = item.area / rowThickness;
      const ratio = Math.max(rowThickness / itemLength, itemLength / rowThickness);
      if (ratio > worstRatio) worstRatio = ratio;
    }

    return worstRatio;
  }

  /**
   * Layout a row of items, returns new bounds for remaining space
   */
  _layoutRow(row, x, y, w, h, output) {
    if (row.length === 0) return { nx: x, ny: y, nw: w, nh: h };

    const areaSum = row.reduce((sum, item) => sum + item.area, 0);
    const horizontal = w >= h;
    const shortSide = horizontal ? h : w;
    const thickness = areaSum / shortSide;
    const gap = this.cellGap;

    let offset = 0;
    for (const item of row) {
      const length = item.area / thickness;

      if (horizontal) {
        output.push({
          ...item,
          x: x + gap / 2,
          y: y + offset + gap / 2,
          w: thickness - gap,
          h: length - gap
        });
      } else {
        output.push({
          ...item,
          x: x + offset + gap / 2,
          y: y + gap / 2,
          w: length - gap,
          h: thickness - gap
        });
      }
      offset += length;
    }

    return horizontal
      ? { nx: x + thickness, ny: y, nw: w - thickness, nh: h }
      : { nx: x, ny: y + thickness, nw: w, nh: h - thickness };
  }
}
