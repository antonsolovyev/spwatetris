package com.solovyev.games.jstetris;

import java.io.Serializable;
import java.util.Date;

import javax.xml.bind.annotation.XmlRootElement;


public class HighScore implements Serializable
{
    private static final long serialVersionUID = 1L;
    private String name;
    private Integer score;
    private Date date;

    public HighScore(String name, Integer score, Date date)
    {
        this.name = name;
        this.score = score;
        this.date = date;
    }

    public HighScore()
    {
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

        HighScore that = (HighScore) o;

        if ((date != null) ? (!date.equals(that.date)) : (that.date != null))
        {
            return false;
        }
        if ((name != null) ? (!name.equals(that.name)) : (that.name != null))
        {
            return false;
        }
        if ((score != null) ? (!score.equals(that.score)) : (that.score != null))
        {
            return false;
        }

        return true;
    }

    @Override
    public int hashCode()
    {
        int result = (name != null) ? name.hashCode() : 0;
        result = (31 * result) + ((score != null) ? score.hashCode() : 0);
        result = (31 * result) + ((date != null) ? date.hashCode() : 0);

        return result;
    }

    @Override
    public String toString()
    {
        return "HighScore{" +
            "name='" + name + '\'' +
            ", score=" + score +
            ", date=" + date +
            '}';
    }
}
