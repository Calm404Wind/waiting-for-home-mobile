import unittest

from .catalog import public_contact_url


class ContactSourcesTest(unittest.TestCase):
    def test_october_official_label_precedes_homepage_and_cached_results(self):
        org = {'website_url': 'https://www.bigtree.org.hk/', 'public_contacts': [
            {'source_type': '机构官网搜索缓存', 'source_url': 'https://example.org/cached'},
            {'source_type': '机构官网', 'source_url': 'https://www.bigtree.org.hk/contact-us',
             'observed_at_raw': ['2026-10-20']},
        ]}
        self.assertEqual(public_contact_url(org), 'https://www.bigtree.org.hk/contact-us')

    def test_first_general_contact_on_latest_day_is_preserved(self):
        org = {'public_contacts': [
            {'source_type': '机构官网', 'source_url': 'https://example.org/old',
             'observed_at_raw': ['2026-10-20']},
            {'source_type': '機構中心官網', 'source_url': 'https://example.org/centre',
             'observed_at_raw': ['2026-11-23']},
            {'source_type': '機構官網', 'source_url': 'https://example.org/about',
             'observed_at_raw': ['2026-11-23']},
            {'source_type': '机构官网', 'source_url': 'https://example.org/cats',
             'observed_at_raw': ['2026-11-23T11:00:09+08:00']},
        ]}
        self.assertEqual(public_contact_url(org), 'https://example.org/about')
