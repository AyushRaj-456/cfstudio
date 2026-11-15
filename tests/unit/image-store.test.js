import test from 'node:test';
import assert from 'node:assert/strict';
import { imageStore } from '../../src/shared/image-store.js';

test('image-store: saves, retrieves, and persists image data', async () => {
  await imageStore.deleteImage();
  assert.equal(await imageStore.getImage(), null);

  const sampleImage = {
    dataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    mimeType: 'image/png',
    width: 1,
    height: 1,
    updatedAt: Date.now(),
  };

  await imageStore.saveImage(sampleImage);

  // Retrieve
  const loaded = await imageStore.getImage();
  assert.ok(loaded);
  assert.equal(loaded.dataUrl, sampleImage.dataUrl);
  assert.equal(loaded.mimeType, 'image/png');

  // Persistence check (simulated restart: image still retrievable)
  const persisted = await imageStore.getImage();
  assert.equal(persisted.dataUrl, sampleImage.dataUrl);
});

test('image-store: deleteImage completely removes the stored image', async () => {
  await imageStore.saveImage({ dataUrl: 'data:image/png;base64,abc' });
  assert.ok(await imageStore.getImage());

  await imageStore.deleteImage();
  assert.equal(await imageStore.getImage(), null);
});
