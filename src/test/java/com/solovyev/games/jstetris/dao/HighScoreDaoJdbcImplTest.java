package com.solovyev.games.jstetris.dao;


import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.StringReader;
import java.sql.Connection;
import java.util.Date;
import java.util.List;

import javax.sql.DataSource;

import com.solovyev.games.jstetris.HighScore;

import org.apache.commons.lang.time.DateUtils;
import org.apache.log4j.Logger;
import org.h2.tools.RunScript;
import org.h2.tools.Server;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;


public class HighScoreDaoJdbcImplTest
{
    private static final Logger LOGGER = Logger.getLogger(HighScoreDaoJdbcImplTest.class.getName());

    public static void startServersAndSleep(int seconds) throws Exception
    {
        Server h2Server = Server.createTcpServer("-tcp", "-tcpPort", "9092", "-tcpAllowOthers");
        h2Server.start();

        Server h2WebServer = Server.createWebServer("-web", "-webAllowOthers", "-webPort", "8082");
        h2WebServer.start();

        System.out.println("====> H2 servers started, JDBC connect string: \"jdbc:h2:tcp://localhost/mem:highScore\", " +
            "sleeping " + seconds + " seconds...");

        Thread.sleep(seconds * DateUtils.MILLIS_PER_SECOND);

        h2Server.stop();
        h2WebServer.stop();
    }

    private DataSource dataSource;
    private HighScoreDao highScoreDao;
    private Connection connection;

    public HighScoreDaoJdbcImplTest() throws Exception
    {
        ApplicationContext applicationContext = new ClassPathXmlApplicationContext("applicationContext-dao-test.xml");
        dataSource = applicationContext.getBean(DataSource.class);
        highScoreDao = (HighScoreDao) applicationContext.getBean(HighScoreDao.class);
    }

    @Before
    public void setup() throws Exception
    {
        connection = dataSource.getConnection();
        RunScript.execute(connection, new StringReader("SET MODE PostgreSQL;"));
        RunScript.execute(connection,
            new BufferedReader(new InputStreamReader(ClassLoader.getSystemResourceAsStream("db/highScore.sql"))));
    }

    @After
    public void teardown() throws Exception
    {
        // Closing last connection erases in memory H2 database
        connection.close();
    }

    @Test
    public void testGetHighScores() throws Exception
    {
        // Add 3 entries
        RunScript.execute(connection,
            new StringReader("insert into HIGH_SCORE (NAME, SCORE, CREATION_DATE) values ('Root', '100', now())"));
        RunScript.execute(connection,
            new StringReader("insert into HIGH_SCORE (NAME, SCORE, CREATION_DATE) values ('Nobody', '101', now())"));
        RunScript.execute(connection,
            new StringReader("insert into HIGH_SCORE (NAME, SCORE, CREATION_DATE) values ('Daemon', '102', now())"));

        List<HighScore> highScoreList = highScoreDao.getHighScores();

        LOGGER.info("highScoreList: " + highScoreList);

        // Ensure we got back 3
        assertEquals("Should have gotten 3 entries", 3, highScoreList.size());

        // Ensure sorting
        assertTrue("First entry should be for Daemon", highScoreList.get(0).getName().equals("Daemon"));

        // Add 20 entries
        for (int i = 0; i < 20; i++)
        {
            RunScript.execute(connection,
                new StringReader("insert into HIGH_SCORE (NAME, SCORE, CREATION_DATE) values ('Daemon', '" + (100 + i) + "', now())"));
        }

        List<HighScore> highScoreList2 = highScoreDao.getHighScores();

        // Ensure only 10 is returned
        assertEquals("Should have gotten 10 entries", 10, highScoreList2.size());
    }

    @Test
    public void testSaveHighScore() throws Exception
    {
        for (int i = 0; i < 20; i++)
        {
            highScoreDao.saveHighScore(new HighScore(null, "Name", 10 + i, new Date()));
        }

        List<HighScore> highScoreList = highScoreDao.getHighScores();

        LOGGER.info("highScoreList: " + highScoreList);

        assertEquals("Should have gotten only 10 entries", 10, highScoreList.size());

        assertEquals("First score should have been 29", 29, (long) highScoreList.get(0).getScore());
        assertEquals("Last score should have been 20", 20, (long) highScoreList.get(highScoreList.size() - 1).getScore());
    }

    @Test
    public void testIsHighScore() throws Exception
    {
        for (int i = 10; i < 20; i++)
        {
            highScoreDao.saveHighScore(new HighScore(null, "Name", i, new Date()));
        }

        List<HighScore> highScoreList = highScoreDao.getHighScores();

        assertTrue("18 should be a high score", highScoreDao.isHighScore(18));
        assertFalse("9 should not be a high score", highScoreDao.isHighScore(9));
    }
}
