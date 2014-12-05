create sequence HIGH_SCORE_SEQ increment 1 start with 15000;

create table HIGH_SCORE (
  ID                BIGINT      default nextval('HIGH_SCORE_SEQ') not null,
  NAME              TEXT        not null,
  SCORE             INTEGER     not null,
  CREATION_DATE     TIMESTAMP   not null,
  constraint PK_HIGH_SCORE primary key (ID)
);

create index HIGH_SCORE_IDX1 on HIGH_SCORE (
   NAME
);
