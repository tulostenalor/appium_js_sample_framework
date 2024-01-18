const fs = require('fs');
const { PNG } = require('pngjs');
const pixelmatch = require('pixelmatch');

export const compareImages = async (baselineImage, newImage) => {
    const baseline = PNG.sync.read(fs.readFileSync(baselineImage));
    const comparison = PNG.sync.read(fs.readFileSync(newImage));
    const { width, height } = baseline;
    const diffImg = new PNG({ width, height });

    return pixelmatch(baseline.data, comparison.data, diffImg.data, width, height, { threshold: 0.5 });
};