package com.solovyev.games.jstetris.dao;

import java.util.*;

import com.google.appengine.api.datastore.*;
import com.solovyev.games.jstetris.HighScore;


public class HighScoreDaoDatastoreImpl implements HighScoreDao
{
    private static final String HIGH_SCORE_ENTITY_KIND = "HighScore";
    private static final String HIGH_SCORES_ENTITY_KIND = "HighScores";
    private static final String HIGH_SCORES_ENTITY_KEY_NAME = "highScoresKeyName";

    private static final String NAME_PROPERTY_NAME = "name";
    private static final String SCORE_PROPERTY_NAME = "score";
    private static final String DATE_PROPERTY_NAME = "date";

    private DatastoreService datastore;
    private Entity highScoresEntity;

    public HighScoreDaoDatastoreImpl()
    {
        datastore = DatastoreServiceFactory.getDatastoreService();

        initHighScoresEntity();
    }

    private void initHighScoresEntity()
    {
        Transaction transaction = datastore.beginTransaction();
        try
        {
            try
            {
                highScoresEntity = datastore.get(KeyFactory.createKey(HIGH_SCORES_ENTITY_KIND,
                            HIGH_SCORES_ENTITY_KEY_NAME));
            }
            catch (EntityNotFoundException e)
            {
                highScoresEntity = new Entity(HIGH_SCORES_ENTITY_KIND, HIGH_SCORES_ENTITY_KEY_NAME);

                datastore.put(highScoresEntity);
            }

            transaction.commit();
        }
        finally
        {
            if (transaction.isActive())
            {
                transaction.rollback();
            }
        }
    }

    @Override
    public List<HighScore> getHighScores()
    {
        List<HighScore> res = new ArrayList<HighScore>();

        for (Entity e : getHighScoreEntities())
        {
            res.add(entityToHighScore(e));
        }

        return res;
    }

    @Override
    public boolean isHighScore(Integer score)
    {
        List<HighScore> highScores = getHighScores();

        if ((highScores.size() < MAX_HIGH_SCORE_RECORDS) || (score >= highScores.get(highScores.size() - 1).getScore()))
        {
            return true;
        }

        return false;
    }

    @Override
    public HighScore saveHighScore(HighScore highScore)
    {
        // Not very good, but leave for now
        Key key = datastore.put(highScoreToEntity(highScore));

        Transaction transaction = datastore.beginTransaction();
        try
        {
            List<Entity> highScoreEntities = getHighScoreEntities();
            for (int i = highScoreEntities.size() - 1; i >= MAX_HIGH_SCORE_RECORDS; i--)
            {
                datastore.delete(highScoreEntities.get(i).getKey());
            }

            transaction.commit();

            return new HighScore(key.getId(), highScore.getName(), highScore.getScore(), highScore.getDate());
        }
        finally
        {
            if (transaction.isActive())
            {
                transaction.rollback();
            }
        }
    }

    private List<Entity> getHighScoreEntities()
    {
        List<Entity> res = datastore.prepare(new Query(HIGH_SCORE_ENTITY_KIND).setAncestor(highScoresEntity.getKey())).asList(FetchOptions.Builder.withDefaults());

        Collections.sort(res, Collections.reverseOrder(new Comparator<Entity>()
                {
                    @Override
                    public int compare(Entity o1, Entity o2)
                    {
                        return compareHighScores(entityToHighScore(o1), entityToHighScore(o2));
                    }
                }));

        return res;
    }

    private Entity highScoreToEntity(HighScore highScore)
    {
        Entity res = new Entity(HIGH_SCORE_ENTITY_KIND, highScoresEntity.getKey());
        res.setProperty("name", highScore.getName());
        res.setProperty("score", highScore.getScore());
        res.setProperty("date", highScore.getDate());

        return res;
    }

    private HighScore entityToHighScore(Entity entity)
    {
        HighScore res = new HighScore(entity.getKey().getId(), (String) entity.getProperty(NAME_PROPERTY_NAME),
                ((Long) entity.getProperty(SCORE_PROPERTY_NAME)).intValue(), (Date) entity.getProperty(DATE_PROPERTY_NAME));

        return res;
    }

    private int compareHighScores(HighScore o1, HighScore o2)
    {
        int res = o1.getScore().compareTo(o2.getScore());

        if (res != 0)
        {
            return res;
        }

        return o1.getDate().compareTo(o2.getDate());
    }
}
