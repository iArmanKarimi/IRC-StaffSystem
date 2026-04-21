import { describe, it, expect, vi } from 'vitest';
import jalaali from 'jalaali-js';
import {
	toPersianDate,
	toGregorianDate,
	getTodayPersian,
	persianToInputValue,
	inputValueToPersian,
	getCurrentPersianYear,
	isValidPersianDate,
} from '../dateUtils';

describe('toPersianDate', () => {
	it('should return "-" for null date', () => {
		expect(toPersianDate(null)).toBe('-');
		expect(toPersianDate(undefined)).toBe('-');
	});

	it('should return "-" for invalid date string', () => {
		expect(toPersianDate('not-a-date')).toBe('-');
	});

	it('should return full format by default', () => {
		const date = new Date('2025-12-30');
		const full = toPersianDate(date);
		expect(full).toMatch(/^\d{4}\/\d{2}\/\d{2}$/);
		expect(toGregorianDate(full)).toEqual(expect.any(Date));
	});

	it('should return compact format with dashes', () => {
		const date = new Date('2025-12-30');
		const full = toPersianDate(date);
		const compact = toPersianDate(date, 'compact');
		expect(compact).toMatch(/^\d{4}-\d{2}-\d{2}$/);
		expect(compact).toBe(full.replaceAll('/', '-'));
	});

	it('should return text format with Persian month names', () => {
		const date = new Date('2025-12-30');
		expect(toPersianDate(date, 'text')).toMatch(/^\d{1,2}\s[\u0600-\u06FF]+\s\d{4}$/);
	});

	it('should handle ISO string dates', () => {
		expect(toPersianDate('2025-12-30')).toMatch(/^\d{4}\/\d{2}\/\d{2}$/);
	});

	it('should handle different dates correctly', () => {
		const date = new Date('2025-01-01');
		expect(toPersianDate(date, 'text')).toMatch(/^\d{1,2}\s[\u0600-\u06FF]+\s\d{4}$/);
	});

	it('should handle dates with day/month padding', () => {
		const date = new Date('2025-03-01');
		const full = toPersianDate(date);
		const compact = toPersianDate(date, 'compact');
		expect(full).toMatch(/^\d{4}\/\d{2}\/\d{2}$/);
		expect(compact).toMatch(/^\d{4}-\d{2}-\d{2}$/);
	});

	it('should handle error gracefully', () => {
		const consoleSpy = vi.spyOn(console, 'error').mockImplementation();
		expect(toPersianDate(new Date('invalid'))).toBe('-');
		expect(consoleSpy).toHaveBeenCalled();
		consoleSpy.mockRestore();
	});
});

describe('toGregorianDate', () => {
	it('should return null for empty string', () => {
		expect(toGregorianDate('')).toBeNull();
		expect(toGregorianDate('  ')).toBeNull();
	});

	it('should parse date with slash separator', () => {
		const date = toGregorianDate('1404/10/09');
		expect(date).toBeInstanceOf(Date);
		expect(date.getFullYear()).toBe(2025);
		expect(date.getMonth() + 1).toBe(12);
		expect(date.getDate()).toBe(30);
	});

	it('should parse date with dash separator', () => {
		const date = toGregorianDate('1404-10-09');
		expect(date).toBeInstanceOf(Date);
		expect(date.getFullYear()).toBe(2025);
		expect(date.getMonth() + 1).toBe(12);
		expect(date.getDate()).toBe(30);
	});

	it('should return null for invalid format', () => {
		expect(toGregorianDate('not-a-date')).toBeNull();
		expect(toGregorianDate('1404/10')).toBeNull();
		expect(toGregorianDate('1404/10/09/extra')).toBeNull();
	});

	it('should return null for non-numeric parts', () => {
		expect(toGregorianDate('abc/def/ghi')).toBeNull();
		expect(toGregorianDate('1404/abc/09')).toBeNull();
	});

	it('should handle year 1403 dates', () => {
		const date = toGregorianDate('1403/01/01');
		expect(date).toBeInstanceOf(Date);
		expect(date.getFullYear()).toBe(2024);
		expect(date.getMonth() + 1).toBe(1);
		expect(date.getDate()).toBe(21);
	});

	it('should handle error gracefully', () => {
		const consoleSpy = vi.spyOn(console, 'error').mockImplementation();
		expect(toGregorianDate('invalid')).toBeNull();
		expect(consoleSpy).toHaveBeenCalled();
		consoleSpy.mockRestore();
	});
});

describe('getTodayPersian', () => {
	it('should return today\'s date in full format by default', () => {
		const result = getTodayPersian();
		expect(result).toMatch(/^\d{4}\/\d{2}\/\d{2}$/);
	});

	it('should return today\'s date in compact format', () => {
		const result = getTodayPersian('compact');
		expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
	});

	it('should return today\'s date in text format', () => {
		const result = getTodayPersian('text');
		expect(result).toMatch(/^\d+ \w+ \d{4}$/);
	});
});

describe('persianToInputValue', () => {
	it('should convert Persian date to ISO format', () => {
		expect(persianToInputValue('1404/10/09')).toBe('2025-12-30');
		expect(persianToInputValue('1404-10-09')).toBe('2025-12-30');
	});

	it('should return empty string for empty input', () => {
		expect(persianToInputValue('')).toBe('');
		expect(persianToInputValue('  ')).toBe('');
	});

	it('should return empty string for invalid date', () => {
		expect(persianToInputValue('invalid')).toBe('');
	});
});

describe('inputValueToPersian', () => {
	it('should convert input value to compact Persian format', () => {
		expect(inputValueToPersian('2025-12-30')).toBe('1404-10-09');
	});

	it('should convert input value to full Persian format', () => {
		expect(inputValueToPersian('2025-12-30', 'full')).toBe('1404/10/09');
	});

	it('should convert input value to text Persian format', () => {
		expect(inputValueToPersian('2025-12-30', 'text')).toBe('9 دی 1404');
	});

	it('should return empty string for empty input', () => {
		expect(inputValueToPersian('')).toBe('');
	});
});

describe('getCurrentPersianYear', () => {
	it('should return the current Persian year', () => {
		const year = getCurrentPersianYear();
		expect(year).toBeGreaterThan(1400);
		expect(year).toBeLessThanOrEqual(1405);
	});
});

describe('isValidPersianDate', () => {
	it('should return true for valid Persian date', () => {
		expect(isValidPersianDate('1404/10/09')).toBe(true);
		expect(isValidPersianDate('1404-10-09')).toBe(true);
	});

	it('should return false for invalid Persian date', () => {
		expect(isValidPersianDate('invalid')).toBe(false);
		expect(isValidPersianDate('1404/13/09')).toBe(false); // Invalid month
		expect(isValidPersianDate('1404/10/32')).toBe(false); // Invalid day
		expect(isValidPersianDate('9999/01/01')).toBe(false); // Invalid year
	});

	it('should return false for empty string', () => {
		expect(isValidPersianDate('')).toBe(false);
	});
});
