import test from 'ava';
import fs from 'fs/promises';
import lookup from '../index.js';

const CWD = process.cwd();

test.before(async () => {
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

test.after(async () => {
  if (await pathExists('online-shop')) {
    await fs.rm('online-shop', { recursive: true });
  }
});

test('lookup() works for .js and .hbs by default', async (t) => {
  const onlineShopFiles = await lookup(`${CWD}/online-shop`);
  const shoesFiles = await lookup(`${CWD}/online-shop/shoes`);
  const shoeFiles = await lookup(`${CWD}/online-shop/shoes/shoe`);

  t.deepEqual(onlineShopFiles, [
    `${CWD}/online-shop/details.hbs`, `${CWD}/online-shop/details.js`,
    `${CWD}/online-shop/index.js`, `${CWD}/online-shop/shoes/brown.hbs`,
    `${CWD}/online-shop/shoes/brown.js`, `${CWD}/online-shop/shoes/index.js`,
    `${CWD}/online-shop/shoes/shoe/brown.js`, `${CWD}/online-shop/shoes/shoe.js`
  ]);
  t.deepEqual(shoesFiles, [
    `${CWD}/online-shop/shoes/brown.hbs`, `${CWD}/online-shop/shoes/brown.js`,
    `${CWD}/online-shop/shoes/index.js`,
    `${CWD}/online-shop/shoes/shoe/brown.js`, `${CWD}/online-shop/shoes/shoe.js`
  ]);
  t.deepEqual(shoeFiles, [
    `${CWD}/online-shop/shoes/shoe/brown.js`
  ]);
});

test('lookup() returns empty array when there are no files', async (t) => {
  const shirtFiles = await lookup(`${CWD}/online-shop/shirts`);

  t.deepEqual(shirtFiles, []);
});

test('lookup(folderName, extensions) works for .js and .hbs', async (t) => {
  const onlineShopJSFiles = await lookup(`${CWD}/online-shop`, (path) => path.endsWith('js'));
  const onlineShopHBSFiles = await lookup(`${CWD}/online-shop`, (path) => path.endsWith('hbs'));
  const onlineShopFiles = await lookup(`${CWD}/online-shop`, (path) => ['js', 'hbs'].some((ext) => path.endsWith(ext)));
  const shoesJSFiles = await lookup(`${CWD}/online-shop/shoes`, (path) => path.endsWith('js'));
  const shoesHBSFiles = await lookup(`${CWD}/online-shop/shoes`, (path) => path.endsWith('hbs'));
  const shoesFiles = await lookup(`${CWD}/online-shop/shoes`, (path) => ['js', 'hbs'].some((ext) => path.endsWith(ext)));
  const shoeFiles = await lookup(`${CWD}/online-shop/shoes/shoe`, (path) => ['js', 'hbs'].some((ext) => path.endsWith(ext)));

  t.deepEqual(onlineShopJSFiles, [
    `${CWD}/online-shop/details.js`, `${CWD}/online-shop/index.js`,
    `${CWD}/online-shop/shoes/brown.js`, `${CWD}/online-shop/shoes/index.js`,
    `${CWD}/online-shop/shoes/shoe/brown.js`, `${CWD}/online-shop/shoes/shoe.js`
  ]);
  t.deepEqual(onlineShopHBSFiles, [
    `${CWD}/online-shop/details.hbs`, `${CWD}/online-shop/shoes/brown.hbs`,
  ]);
  t.deepEqual(onlineShopFiles, [
    `${CWD}/online-shop/details.hbs`, `${CWD}/online-shop/details.js`,
    `${CWD}/online-shop/index.js`, `${CWD}/online-shop/shoes/brown.hbs`,
    `${CWD}/online-shop/shoes/brown.js`, `${CWD}/online-shop/shoes/index.js`,
    `${CWD}/online-shop/shoes/shoe/brown.js`, `${CWD}/online-shop/shoes/shoe.js`
  ]);
  t.deepEqual(shoesJSFiles, [
    `${CWD}/online-shop/shoes/brown.js`, `${CWD}/online-shop/shoes/index.js`,
    `${CWD}/online-shop/shoes/shoe/brown.js`, `${CWD}/online-shop/shoes/shoe.js`
  ]);
  t.deepEqual(shoesHBSFiles, [`${CWD}/online-shop/shoes/brown.hbs`]);
  t.deepEqual(shoesFiles, [
    `${CWD}/online-shop/shoes/brown.hbs`, `${CWD}/online-shop/shoes/brown.js`,
    `${CWD}/online-shop/shoes/index.js`, `${CWD}/online-shop/shoes/shoe/brown.js`,
    `${CWD}/online-shop/shoes/shoe.js`,
  ]);
  t.deepEqual(shoeFiles, [`${CWD}/online-shop/shoes/shoe/brown.js`]);
});

test('lookup(folderName, extensions) works for .hbs when there are no files', async (t) => {
  const shoeFiles = await lookup(`${CWD}/online-shop/shoes/shoe`, (path) => path.endsWith('hbs'));
  const shirtFiles = await lookup(`${CWD}/online-shop/shirts`, (path) => path.endsWith('hbs'));

  t.deepEqual(shoeFiles, []);
  t.deepEqual(shirtFiles, []);
});

test('lookup(folderName, extensions) works for .js when there are no files', async (t) => {
  const shirtFiles = await lookup(`${CWD}/online-shop/shirts`, (path) => path.endsWith('js'));

  t.deepEqual(shirtFiles, []);
});

async function pathExists(path) {
  try {
    await fs.access(path);

    return true;
  } catch {
    return false;
  }
}
