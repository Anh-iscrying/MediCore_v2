alter table public.specialties
add column if not exists exam_template jsonb default '{"fields":[]}'::jsonb;

update public.specialties
set exam_template = '{"fields":[]}'::jsonb
where exam_template is null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'specialties_exam_template_is_object'
  ) then
    alter table public.specialties
    add constraint specialties_exam_template_is_object
    check (
      exam_template is null
      or jsonb_typeof(exam_template) = 'object'
    );
  end if;
end $$;

comment on column public.specialties.exam_template is
'JSON template các trường khám bệnh riêng theo từng chuyên khoa';
