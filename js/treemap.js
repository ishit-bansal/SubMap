/*
 * squarified treemap layout
 * based on the bruls et al. algorithm
 * https://www.win.tue.nl/~vanwijk/stm.pdf
 */
class Treemap {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.cellGap = 4;
  }

  layout(items) {
    if (items.length === 0) return [];

    let total = 0;
    for (let i = 0; i < items.length; i++) {
      total += items[i].val;
    }

    const normalized = [];
    const totalArea = this.width * this.height;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      normalized.push({
        ...item,
        area: (item.val / total) * totalArea
      });
    }

    const rectangles = [];
    this._squarify(normalized, [], 0, 0, this.width, this.height, rectangles);
    return rectangles;
  }

  _squarify(remaining, currentRow, x, y, w, h, output) {
    if (remaining.length === 0) {
      this._layoutRow(currentRow, x, y, w, h, output);
      return;
    }

    const next = remaining[0];
    const withNext = currentRow.concat([next]);

    if (currentRow.length === 0 || this._worstRatio(currentRow, w, h) >= this._worstRatio(withNext, w, h)) {
      this._squarify(remaining.slice(1), withNext, x, y, w, h, output);
    } else {
      const bounds = this._layoutRow(currentRow, x, y, w, h, output);
      this._squarify(remaining, [], bounds.nx, bounds.ny, bounds.nw, bounds.nh, output);
    }
  }

  _worstRatio(row, w, h) {
    if (row.length === 0) return Infinity;

    let areaSum = 0;
    for (let i = 0; i < row.length; i++) {
      areaSum += row[i].area;
    }

    const shortSide = Math.min(w, h);
    const rowThickness = areaSum / shortSide;

    let worstRatio = 0;
    for (let i = 0; i < row.length; i++) {
      const itemLength = row[i].area / rowThickness;
      const ratio = Math.max(rowThickness / itemLength, itemLength / rowThickness);
      if (ratio > worstRatio) {
        worstRatio = ratio;
      }
    }

    return worstRatio;
  }

  _layoutRow(row, x, y, w, h, output) {
    if (row.length === 0) {
      return { nx: x, ny: y, nw: w, nh: h };
    }

    let areaSum = 0;
    for (let i = 0; i < row.length; i++) {
      areaSum += row[i].area;
    }

    const horizontal = (w >= h);
    const shortSide = horizontal ? h : w;
    const thickness = areaSum / shortSide;
    const gap = this.cellGap;

    let offset = 0;

    for (let i = 0; i < row.length; i++) {
      const item = row[i];
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

    if (horizontal) {
      return { nx: x + thickness, ny: y, nw: w - thickness, nh: h };
    } else {
      return { nx: x, ny: y + thickness, nw: w, nh: h - thickness };
    }
  }
}

async function exportAsImage() {
  const exportContainer = document.getElementById("export-container");
  if (!exportContainer) return;

  const btn = event.target.closest("button");
  if (!btn) return;
  
  const originalHtml = btn.innerHTML;
  btn.innerHTML = '<span class="iconify h-4 w-4 animate-spin" data-icon="ph:spinner-bold"></span>';
  btn.disabled = true;

  try {
    const pngUrl = await modernScreenshot.domToPng(exportContainer, {
      scale: 2,
      backgroundColor: "#ffffff",
      style: {
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        borderRadius: "2rem",
        overflow: "hidden"
      },
      onCloneNode: function(node) {
        if (node.style) {
          node.style.fontFamily = "system-ui, -apple-system, sans-serif";
        }
        if (node.querySelectorAll) {
          var elements = node.querySelectorAll("*");
          for (var i = 0; i < elements.length; i++) {
            if (elements[i].style) {
              elements[i].style.fontFamily = "system-ui, -apple-system, sans-serif";
            }
          }
        }
        return node;
      },
      fetch: { bypassingCache: true }
    });

    var downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = "subscriptions-" + new Date().toISOString().split("T")[0] + ".png";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();

  } catch (err) {
    console.error("export failed:", err);
    alert("Export failed: " + err.message);
  }

  btn.innerHTML = originalHtml;
  btn.disabled = false;
}
