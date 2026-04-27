<?php

namespace App\Support;

use Carbon\CarbonImmutable;

class DepartureDateNormalizer
{
    public static function normalize(?string $value): ?string
    {
        if ($value === null || $value === '') {
            return $value;
        }

        if (preg_match('/^\d{2}\.\d{2}\.\d{4}$/', $value) !== 1) {
            return $value;
        }

        $date = CarbonImmutable::createFromFormat('d.m.Y', $value);

        if ($date === false || $date->format('d.m.Y') !== $value) {
            return $value;
        }

        return $date->format('Y-m-d');
    }
}
