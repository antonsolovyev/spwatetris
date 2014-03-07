package com.solovyev.games.jstetris.dao;

import java.util.List;

import com.solovyev.games.jstetris.HighScore;


public interface HighScoreDao
{
    public static final int MAX_HIGH_SCORE_RECORDS = 10;

    public List<HighScore> getHighScores();

    public boolean isHighScore(Integer score);

    public void saveHighScore(HighScore highScore);
}
