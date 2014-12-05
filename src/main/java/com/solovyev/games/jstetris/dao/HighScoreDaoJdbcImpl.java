package com.solovyev.games.jstetris.dao;

import java.sql.*;
import java.util.*;
import java.util.logging.Logger;

import javax.sql.DataSource;

import com.solovyev.games.jstetris.HighScore;

import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;


public class HighScoreDaoJdbcImpl implements HighScoreDao
{
    private static final Logger LOGGER = Logger.getLogger(HighScoreDaoJdbcImpl.class.getName());

    private final NamedParameterJdbcTemplate namedParameterJdbcTemplate;

    public HighScoreDaoJdbcImpl(DataSource dataSource)
    {
        namedParameterJdbcTemplate = new NamedParameterJdbcTemplate(dataSource);
    }

    @Override
    public List<HighScore> getHighScores()
    {
        String query = "select * from HIGH_SCORE" +
            " order by SCORE desc, CREATION_DATE desc limit :maxHighScoreRecords;";

        RowMapper<HighScore> rowMapper = new RowMapper<HighScore>()
            {
                @Override
                public HighScore mapRow(ResultSet rs, int rowNum) throws SQLException
                {
                    return new HighScore(rs.getLong("ID"), rs.getString("NAME"), rs.getInt("SCORE"),
                            getTimestampAsDate(rs, "CREATION_DATE"));
                }
            };

        MapSqlParameterSource mapSqlParameterSource = new MapSqlParameterSource();
        mapSqlParameterSource.addValue("maxHighScoreRecords", MAX_HIGH_SCORE_RECORDS);

        return namedParameterJdbcTemplate.query(query, mapSqlParameterSource, rowMapper);
    }

    private java.util.Date getTimestampAsDate(ResultSet rs, String column) throws SQLException
    {
        Timestamp ts = rs.getTimestamp(column);

        return (ts == null) ? null : new java.util.Date(ts.getTime());
    }

    @Override
    public boolean isHighScore(Integer score)
    {
        String query = "select count(*) as COUNT, min(SCORE) as min from HIGH_SCORE;";
        Map<String, Object> map = namedParameterJdbcTemplate.queryForMap(query, new MapSqlParameterSource());

        Long count = (Long) map.get("count");
        Integer min = (Integer) map.get("min");

        boolean res = false;
        if ((count < MAX_HIGH_SCORE_RECORDS) || ((min != null) && (score >= min)))
        {
            res = true;
        }

        return res;
    }

    @Override
    public HighScore saveHighScore(HighScore highScore)
    {
        String query = "insert into HIGH_SCORE (NAME, SCORE, CREATION_DATE)" +
            " values (:name, :score, :creationDate)";
        MapSqlParameterSource mapSqlParameterSource = new MapSqlParameterSource();
        mapSqlParameterSource.addValue("name", highScore.getName());
        mapSqlParameterSource.addValue("score", highScore.getScore());
        mapSqlParameterSource.addValue("creationDate", highScore.getDate());

        KeyHolder keyHolder = new GeneratedKeyHolder();
        namedParameterJdbcTemplate.update(query, mapSqlParameterSource, keyHolder, new String[] { "id" });

        String query2 = "delete from HIGH_SCORE where ID not in (select ID from HIGH_SCORE" +
            " order by SCORE desc, CREATION_DATE desc limit :maxHighScoreRecords)";
        MapSqlParameterSource mapSqlParameterSource2 = new MapSqlParameterSource();
        mapSqlParameterSource2.addValue("maxHighScoreRecords", MAX_HIGH_SCORE_RECORDS);
        namedParameterJdbcTemplate.update(query2, mapSqlParameterSource2);

        return new HighScore(keyHolder.getKey().longValue(), highScore.getName(), highScore.getScore(),
                highScore.getDate());
    }
}
