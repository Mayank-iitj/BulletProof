import { describe, it, expect } from 'vitest';
import { buildSystemPrompt, EXPERIMENT_LOCKED } from '../lib/prompts';
import { CONCISE_STYLE_SPEC } from '../lib/prompts/concise';
import { IMPACT_STYLE_SPEC } from '../lib/prompts/impact';
import { STORY_STYLE_SPEC } from '../lib/prompts/story';

describe('Prompts Integrity and Style Specifications', () => {
  it('experiment lock marker must be active', () => {
    expect(EXPERIMENT_LOCKED).toBe(true);
  });

  it('builds concise system prompt with strict word and placeholder constraints', () => {
    const prompt = buildSystemPrompt('concise');
    expect(prompt).toContain('STYLE SPEC: CONTROL (CONCISE)');
    expect(prompt).toContain('maximum 20 words');
    expect(prompt).toContain('NEVER invent facts');
    expect(prompt).toContain('<bullet>');
  });

  it('builds impact system prompt with quantified outcome and placeholder rules', () => {
    const prompt = buildSystemPrompt('impact');
    expect(prompt).toContain('STYLE SPEC: TEAM IMPACT');
    expect(prompt).toContain('[X%]');
    expect(prompt).toContain('Quantified Outcome');
  });

  it('builds story system prompt with CAR narrative framework', () => {
    const prompt = buildSystemPrompt('story');
    expect(prompt).toContain('STYLE SPEC: TEAM STORY');
    expect(prompt).toContain('Context-Action-Result');
    expect(prompt).toContain('30 to 40 words');
  });

  it('injects target role context when specified', () => {
    const prompt = buildSystemPrompt('impact', 'Lead Cloud Architect');
    expect(prompt).toContain('Lead Cloud Architect');
  });
});
