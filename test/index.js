import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs/promises';
import lookup from '../index.js';

// TODO: Remove CWD for deno compat
const CWD = process.cwd();

describe('recursiveLookup(pathOrGlob, filter)', () => {
  before(async () => {
    if (await pathExists('online-shop')) {
      await fs.rm('online-shop', { recursive: true });
    }

    await fs.mkdir('online-shop', { recursive: true });
    await Promise.all([
      fs.writeFile('online-shop/index.js', '// find me in online-shop/index.js'),
      fs.writeFile('online-shop/details.js', '// find me in online-shop/details.js'),
      fs.writeFile('online-shop/details.hbs', '// find me in online-shop/details.hbs'),
      fs.mkdir('online-shop/shoes', { recursive: true }),
      fs.mkdir('online-shop/shirts', { recursive: true })
    ]);
    await Promise.all([
      fs.writeFile('online-shop/shoes/shoe.js', '// find me in online-shop/shoes/shoe.js'),
      fs.writeFile('online-shop/shoes/index.js', '// find me in online-shop/shoes/index.js'),
      fs.writeFile('online-shop/shoes/brown.js', '// find me in online-shop/shoes/brown.js'),
      fs.writeFile('online-shop/shoes/brown.hbs', '// find me in online-shop/shoes/brown.hbs'),
      fs.mkdir('online-shop/shoes/shoe', { recursive: true })
    ]);
    await fs.writeFile('online-shop/shoes/shoe/brown.js', '// find me in online-shop/shoes/shoe/brown.js')
  });

  after(async () => {
    if (await pathExists('online-shop')) {
      await fs.rm('online-shop', { recursive: true });
    }
  });

  it('lookup() works for .js and .hbs by default', async () => {
    const onlineShopFiles = await lookup(`${CWD}/online-shop`);
    const shoesFiles = await lookup(`${CWD}/online-shop/shoes`);
    const shoeFiles = await lookup(`${CWD}/online-shop/shoes/shoe`);

    assert.deepEqual(onlineShopFiles, [
      `${CWD}/online-shop/details.hbs`, `${CWD}/online-shop/details.js`,
      `${CWD}/online-shop/index.js`, `${CWD}/online-shop/shoes/brown.hbs`,
      `${CWD}/online-shop/shoes/brown.js`, `${CWD}/online-shop/shoes/index.js`,
      `${CWD}/online-shop/shoes/shoe/brown.js`, `${CWD}/online-shop/shoes/shoe.js`
    ]);
    assert.deepEqual(shoesFiles, [
      `${CWD}/online-shop/shoes/brown.hbs`, `${CWD}/online-shop/shoes/brown.js`,
      `${CWD}/online-shop/shoes/index.js`,
      `${CWD}/online-shop/shoes/shoe/brown.js`, `${CWD}/online-shop/shoes/shoe.js`
    ]);
    assert.deepEqual(shoeFiles, [
      `${CWD}/online-shop/shoes/shoe/brown.js`
    ]);
  });

  it('lookup() returns empty array when there are no files', async () => {
    const shirtFiles = await lookup(`${CWD}/online-shop/shirts`);

    assert.deepEqual(shirtFiles, []);
  });

  it('lookup(folderName, extensions) works for .js and .hbs', async () => {
    const onlineShopJSFiles = await lookup(`${CWD}/online-shop`, (path) => path.endsWith('js'));
    const onlineShopHBSFiles = await lookup(`${CWD}/online-shop`, (path) => path.endsWith('hbs'));
    const onlineShopFiles = await lookup(`${CWD}/online-shop`, (path) => ['js', 'hbs'].some((ext) => path.endsWith(ext)));
    const shoesJSFiles = await lookup(`${CWD}/online-shop/shoes`, (path) => path.endsWith('js'));
    const shoesHBSFiles = await lookup(`${CWD}/online-shop/shoes`, (path) => path.endsWith('hbs'));
    const shoesFiles = await lookup(`${CWD}/online-shop/shoes`, (path) => ['js', 'hbs'].some((ext) => path.endsWith(ext)));
    const shoeFiles = await lookup(`${CWD}/online-shop/shoes/shoe`, (path) => ['js', 'hbs'].some((ext) => path.endsWith(ext)));

    assert.deepEqual(onlineShopJSFiles, [
      `${CWD}/online-shop/details.js`, `${CWD}/online-shop/index.js`,
      `${CWD}/online-shop/shoes/brown.js`, `${CWD}/online-shop/shoes/index.js`,
      `${CWD}/online-shop/shoes/shoe/brown.js`, `${CWD}/online-shop/shoes/shoe.js`
    ]);
    assert.deepEqual(onlineShopHBSFiles, [
      `${CWD}/online-shop/details.hbs`, `${CWD}/online-shop/shoes/brown.hbs`,
    ]);
    assert.deepEqual(onlineShopFiles, [
      `${CWD}/online-shop/details.hbs`, `${CWD}/online-shop/details.js`,
      `${CWD}/online-shop/index.js`, `${CWD}/online-shop/shoes/brown.hbs`,
      `${CWD}/online-shop/shoes/brown.js`, `${CWD}/online-shop/shoes/index.js`,
      `${CWD}/online-shop/shoes/shoe/brown.js`, `${CWD}/online-shop/shoes/shoe.js`
    ]);
    assert.deepEqual(shoesJSFiles, [
      `${CWD}/online-shop/shoes/brown.js`, `${CWD}/online-shop/shoes/index.js`,
      `${CWD}/online-shop/shoes/shoe/brown.js`, `${CWD}/online-shop/shoes/shoe.js`
    ]);
    assert.deepEqual(shoesHBSFiles, [`${CWD}/online-shop/shoes/brown.hbs`]);
    assert.deepEqual(shoesFiles, [
      `${CWD}/online-shop/shoes/brown.hbs`, `${CWD}/online-shop/shoes/brown.js`,
      `${CWD}/online-shop/shoes/index.js`, `${CWD}/online-shop/shoes/shoe/brown.js`,
      `${CWD}/online-shop/shoes/shoe.js`,
    ]);
    assert.deepEqual(shoeFiles, [`${CWD}/online-shop/shoes/shoe/brown.js`]);
  });

  it('lookup(folderName, extensions) works for .hbs when there are no files', async () => {
    const shoeFiles = await lookup(`${CWD}/online-shop/shoes/shoe`, (path) => path.endsWith('hbs'));
    const shirtFiles = await lookup(`${CWD}/online-shop/shirts`, (path) => path.endsWith('hbs'));

    assert.deepEqual(shoeFiles, []);
    assert.deepEqual(shirtFiles, []);
  });

  it('lookup(folderName, extensions) works for .js when there are no files', async () => {
    const shirtFiles = await lookup(`${CWD}/online-shop/shirts`, (path) => path.endsWith('js'));

    assert.deepEqual(shirtFiles, []);
  });
});

async function pathExists(path) {
  try {
    await fs.access(path);

    return true;
  } catch {
    return false;
  }
}
