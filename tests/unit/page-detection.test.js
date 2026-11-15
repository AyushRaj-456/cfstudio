import test from 'node:test';
import assert from 'node:assert/strict';
import { detectPageCategory } from '../../src/content/codeforces-adapter.js';

test('page detection: categorizes URLs accurately', () => {
  assert.equal(detectPageCategory('https://codeforces.com/'), 'home');
  assert.equal(detectPageCategory('https://codeforces.com/index'), 'home');
  assert.equal(detectPageCategory('https://codeforces.com/enter'), 'login');
  assert.equal(detectPageCategory('https://codeforces.com/register'), 'login');
  assert.equal(detectPageCategory('https://codeforces.com/problemset'), 'problems');
  assert.equal(detectPageCategory('https://codeforces.com/problemset/problem/4/A'), 'problem');
  assert.equal(detectPageCategory('https://codeforces.com/contest/1/problem/A'), 'problem');
  assert.equal(detectPageCategory('https://codeforces.com/contest/1'), 'contest');
  assert.equal(detectPageCategory('https://codeforces.com/contests'), 'contest');
  assert.equal(detectPageCategory('https://codeforces.com/contest/1/standings'), 'standings');
  assert.equal(detectPageCategory('https://codeforces.com/contest/1/status'), 'submissions');
  assert.equal(detectPageCategory('https://codeforces.com/submissions/tourist'), 'submissions');
  assert.equal(detectPageCategory('https://codeforces.com/profile/tourist'), 'profile');
  assert.equal(detectPageCategory('https://codeforces.com/blog/entry/12345'), 'blog');
  assert.equal(detectPageCategory('https://codeforces.com/groups'), 'groups');
  assert.equal(detectPageCategory('https://codeforces.com/group/abc/members'), 'groups');
  assert.equal(detectPageCategory('https://codeforces.com/unknown-page'), 'other');
});
