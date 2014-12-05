package com.solovyev.games.jstetris.dao;

import java.util.List;

import com.solovyev.games.jstetris.HighScore;

import org.springframework.transaction.annotation.Transactional;


public interface HighScoreDao
{
    public static final int MAX_HIGH_SCORE_RECORDS = 10;

    @Transactional
    public List<HighScore> getHighScores();

    @Transactional
    public boolean isHighScore(Integer score);

    @Transactional
    public HighScore saveHighScore(HighScore highScore);
}
