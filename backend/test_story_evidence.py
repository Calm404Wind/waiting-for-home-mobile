import unittest

from .live_story import allowed, extract
from .stories import snapshot_story
from .waiting import waiting_fields


def observation(text, snapshot='2026-10-20', **extra):
    return {'_id': 'test', 'organisation_id': 'pgrs', 'source_url': 'https://www.pgrs.life/pet-info/?pet_id=1',
            'snapshot_date': snapshot, 'source_values_raw': {'source_fields': {'其他資訊': text}}, **extra}


class EvidenceTests(unittest.TestCase):
    def test_exact_arrival_uses_actual_capture(self):
        result = waiting_fields(observation('Arrived on 2025-02-28; rescued in Shan Ha Tsuen.'))
        self.assertEqual((result['intake_date'], result['wait_days_min'], result['wait_days_max']), ('2025-02-28', 599, 599))

    def test_month_is_an_interval(self):
        result = waiting_fields(observation('我在2024年11月被督察救起。', '2026-11-23'))
        self.assertEqual((result['intake_date'], result['intake_precision']), ('2024-11', 'month'))
        self.assertEqual((result['wait_days_min'], result['wait_days'], result['wait_days_max']), (723, 737, 752))
        result = waiting_fields(observation('我在2026年11月被督察救起。', '2026-11-23'))
        self.assertEqual((result['wait_days_min'], result['wait_days_max']), (0, 22))

    def test_unrelated_dates_and_impossible_dates_are_excluded(self):
        for text in ['First appointment on 2025-06-05, rescued in Yuen Long.',
                     'Born on 2025-01-01. Rescued in Sai Kung.', 'Sent to foster 2025-08-03, Rescued in Ping Shan',
                     'Rescued on 2026-02-30', 'Rescued on 2026-12-30']:
            with self.subTest(text=text):
                self.assertIsNone(waiting_fields(observation(text))['intake_date'])
        self.assertIsNone(waiting_fields(observation('2024年3月被救起。', birth_date_evidence={'from': '2024-07-01'}))['intake_date'])

    def test_evidence_belongs_to_the_same_date(self):
        result = waiting_fields(observation('First appointment on 2025-08-01; Rescued on 2025-07-14.'))
        self.assertEqual(result['intake_date'], '2025-07-14')
        self.assertNotIn('appointment', result['intake_evidence'])

    def test_source_fields_and_boilerplate(self):
        story = snapshot_story(observation('Rescued on 2024-09-19'))
        self.assertEqual(story['paragraphs'], ['Rescued on 2024-09-19'])
        self.assertEqual(story['coverage'], 'fields')
        no_story = observation('', source_values_raw={'description_excerpt': 'This website is designed by ABC'})
        self.assertFalse(snapshot_story(no_story)['has_narrative'])

    def test_live_source_is_restricted_to_verified_individual_page(self):
        self.assertTrue(allowed('https://kirstenszoo.com/animals/verity/', 'kirstens_zoo'))
        self.assertFalse(allowed('https://kirstenszoo.com/animal_cat/cats/', 'kirstens_zoo'))
        self.assertFalse(allowed('https://kirstenszoo.com.example.com/animals/verity/', 'kirstens_zoo'))
        html = '<h1>VERITY</h1><div class="info"><p>Verity is a gentle cat.</p><p>Unable to adopt? Donate!</p></div><footer>Other names</footer>'
        self.assertEqual(extract(html, 'kirstens_zoo', 'VERITY'), ['Verity is a gentle cat.'])
        self.assertEqual(extract(html, 'kirstens_zoo', 'Omar'), [])


if __name__ == '__main__':
    unittest.main()
