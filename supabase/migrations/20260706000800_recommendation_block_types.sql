alter table guide_blocks drop constraint guide_blocks_type_check;

alter table guide_blocks add constraint guide_blocks_type_check
  check (
    type in (
      'wifi', 'checkin', 'checkout', 'rules', 'parking', 'appliances', 'custom',
      'emergencias', 'pool', 'restaurants', 'drinks', 'nightlife', 'attractions'
    )
  );
