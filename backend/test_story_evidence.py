import unittest

from .live_story import allowed, extract
from .stories import snapshot_story
from .waiting import reviewed_starts, waiting_fields


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
        report = waiting_fields(observation('2026年7月6號，我被發現，愛協督察隨即嚟救我走。'))
        self.assertEqual(report['intake_basis'], '官網記載的救援行動起點')

    def test_reviewed_discovery_and_rescue_share_one_source(self):
        obs = {'_id': 'obs_20261123_spca_47d8869d6a8dc5', 'organisation_id': 'spca',
               'snapshot_date': '2026-11-23',
               'source_url': 'https://www.spca.org.hk/zh-hant/what-we-do/animals-for-adoption-details?code=541413'}
        result = waiting_fields(obs)
        self.assertEqual((result['intake_date'], result['wait_days']), ('2022-12-14', 1440))
        self.assertEqual(result['intake_basis'], '官網記載的救援行動起點')
        self.assertIn('先救出我哋', result['intake_evidence'])
        self.assertIsNone(waiting_fields({**obs, 'source_url': 'https://example.org/another-animal'})['wait_days'])
        self.assertIsNone(waiting_fields({**obs, '_id': 'a-different-observation'})['wait_days'])

    def test_reviewed_month_keeps_original_precision(self):
        key = 'obs_20261123_spca_216a61eaa1760d'
        obs = {'_id': key, 'organisation_id': 'spca', 'snapshot_date': '2026-11-23',
               'source_url': reviewed_starts()[key]['source_url']}
        result = waiting_fields(obs)
        self.assertEqual(result['intake_date'], '2026-08')
        self.assertEqual((result['wait_days_min'], result['wait_days_max']), (84, 114))

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
