package com.solovyev.games.jstetris.dao;

import java.sql.Date;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

import javax.sql.DataSource;

import com.solovyev.games.jstetris.HighScore;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.simple.ParameterizedRowMapper;
import org.springframework.transaction.annotation.Transactional;


public class HighScoreDaoJdbcImpl implements HighScoreDao
{
    private static final Logger logger = Logger.getLogger(HighScoreDaoJdbcImpl.class.getName());

    private JdbcTemplate jdbcTemplate;

    public HighScoreDaoJdbcImpl(DataSource dataSource)
    {
        this.jdbcTemplate = new JdbcTemplate(dataSource);
    }

    @Override
    @Transactional(readOnly = true)
    public List<HighScore> getHighScores()
    {
        List<HighScore> highScores = jdbcTemplate.query(
                "select * from high_score order by score desc, date desc;", new ParameterizedRowMapper<HighScore>()
                {
                    @Override
                    public HighScore mapRow(ResultSet rs, int rowNum) throws SQLException
                    {
                        String name = rs.getString("NAME");
                        Integer score = rs.getInt("SCORE");
                        Date date = rs.getDate("DATE");

                        return new HighScore(name, score, date);
                    }
                    ;
                });

        List<HighScore> res = highScores.subList(0, MAX_HIGH_SCORE_RECORDS);

        return res;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isHighScore(Integer score)
    {
        Map<String, Object> map = jdbcTemplate.queryForMap(
                "select count(*) as count, min(score) as min from high_score;");
        Long count = (Long) map.get("COUNT");
        Integer min = (Integer) map.get("MIN");

        boolean res = false;
        if ((count < MAX_HIGH_SCORE_RECORDS) || ((min != null) && (score >= min)))
        {
            res = true;
        }

        return res;
    }

    @Override
    @Transactional(readOnly = false)
    public void saveHighScore(HighScore highScore)
    {
        jdbcTemplate.update("insert into high_score (name, score, date) values (?, ?, ?)",
            highScore.getName(), highScore.getScore(), highScore.getDate());

        jdbcTemplate.update(
            "delete from high_score where id not in (select top ? id from high_score order by score desc, date desc);",
            MAX_HIGH_SCORE_RECORDS);
    }
}
