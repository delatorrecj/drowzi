import { normalizeSpeech, passageMatches } from '@/src/features/voice/passageMatch';

describe('normalizeSpeech', () => {
  it('lowercases, strips punctuation, collapses whitespace', () => {
    expect(normalizeSpeech('  Today, I WAKE up!! ')).toBe('today i wake up');
  });
});

describe('passageMatches', () => {
  const passage = 'Today I wake up on purpose';

  it('matches exact (ignoring case/punctuation)', () => {
    expect(passageMatches('today i wake up on purpose.', passage)).toBe(true);
  });

  it('matches when transcript contains the passage', () => {
    expect(passageMatches('um, today i wake up on purpose, yeah', passage)).toBe(true);
  });

  it('matches when the passage contains a shorter transcript', () => {
    expect(passageMatches('today i wake up on', 'today i wake up on')).toBe(true);
  });

  it('matches at ≥85% word overlap despite one wrong word', () => {
    // 7-word passage: one miss = 6/7 ≈ 0.857, still clears the 0.85 bar.
    expect(passageMatches('today i woke up on purpose now', 'today i wake up on purpose now')).toBe(
      true,
    );
  });

  it('rejects unrelated speech', () => {
    expect(passageMatches('the quick brown fox', passage)).toBe(false);
  });

  it('rejects empty input', () => {
    expect(passageMatches('', passage)).toBe(false);
    expect(passageMatches('hello', '')).toBe(false);
  });
});
