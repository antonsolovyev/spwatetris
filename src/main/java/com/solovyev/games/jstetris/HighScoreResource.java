package com.solovyev.games.jstetris;

import java.util.List;
import java.util.logging.Logger;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;

import com.solovyev.games.jstetris.dao.HighScoreDao;


@Path("/")
public class HighScoreResource
{
    private static final Logger LOGGER = Logger.getLogger(HighScoreResource.class.getName());

    private final HighScoreDao highScoreDao;

    public HighScoreResource(HighScoreDao highScoreDao)
    {
        this.highScoreDao = highScoreDao;
    }

    @GET
    @Path("/getHighScores")
    @Produces({ MediaType.APPLICATION_JSON })
    public List<HighScore> getHighScores()
    {
        return highScoreDao.getHighScores();
    }

    @GET
    @Path("/isHighScore")
    @Produces({ MediaType.APPLICATION_JSON })
    public Boolean isHighScore(@QueryParam("score") Integer score)
    {
        return highScoreDao.isHighScore(score);
    }

    @POST
    @Path("/saveHighScore")
    @Consumes({ MediaType.APPLICATION_JSON })
    public void saveHighScore(HighScore highScore)
    {
        highScoreDao.saveHighScore(highScore);
    }
}
