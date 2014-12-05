package com.solovyev.games.jstetris;

import java.util.Date;


public class HighScore
{
    private final Long id;
    private final String name;
    private final Integer score;
    private final Date date;

    public HighScore(Long id, String name, Integer score, Date date)
    {
        this.id = id;
        this.name = name;
        this.score = score;
        this.date = date;
    }

    public HighScore()
    {
        this(null, null, null, null);
    }

    public String getName()
    {
        return name;
    }

    public Integer getScore()
    {
        return score;
    }

    public Date getDate()
    {
        return date;
    }

    public Long getId()
    {
        return id;
    }

    @Override
    public String toString()
    {
        return "HighScore{" +
            "id=" + id +
            ", name='" + name + '\'' +
            ", score=" + score +
            ", date=" + date +
            '}';
    }

    @Override
    public boolean equals(Object o)
    {
        if (this == o)
        {
            return true;
        }
        if ((o == null) || (getClass() != o.getClass()))
        {
            return false;
        }

        HighScore highScore = (HighScore) o;

        if ((date != null) ? (!date.equals(highScore.date)) : (highScore.date != null))
        {
            return false;
        }
        if ((id != null) ? (!id.equals(highScore.id)) : (highScore.id != null))
        {
            return false;
        }
        if ((name != null) ? (!name.equals(highScore.name)) : (highScore.name != null))
        {
            return false;
        }
        if ((score != null) ? (!score.equals(highScore.score)) : (highScore.score != null))
        {
            return false;
        }

        return true;
    }

    @Override
    public int hashCode()
    {
        int result = (id != null) ? id.hashCode() : 0;
        result = (31 * result) + ((name != null) ? name.hashCode() : 0);
        result = (31 * result) + ((score != null) ? score.hashCode() : 0);
        result = (31 * result) + ((date != null) ? date.hashCode() : 0);

        return result;
    }
}
