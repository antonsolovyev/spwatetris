package com.solovyev.games.jstetris;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import javax.ws.rs.core.MediaType;

import com.solovyev.games.jstetris.dao.HighScoreDao;
import com.sun.jersey.api.client.GenericType;
import com.sun.jersey.api.client.WebResource;
import com.sun.jersey.api.client.config.ClientConfig;
import com.sun.jersey.api.client.config.DefaultClientConfig;
import com.sun.jersey.api.json.JSONConfiguration;
import com.sun.jersey.spi.spring.container.servlet.SpringServlet;
import com.sun.jersey.test.framework.AppDescriptor;
import com.sun.jersey.test.framework.JerseyTest;
import com.sun.jersey.test.framework.WebAppDescriptor;

import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.junit.After;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;
import org.mockito.invocation.InvocationOnMock;
import org.mockito.stubbing.Answer;
import org.springframework.aop.framework.ProxyFactoryBean;
import org.springframework.web.context.ContextLoaderListener;
import org.springframework.web.context.request.RequestContextListener;

import static org.junit.Assert.assertTrue;
import static org.mockito.Matchers.anyObject;
import static org.mockito.Mockito.*;


public class HighScoreResourceTest extends JerseyTest
{
    private static final Logger LOGGER = Logger.getLogger(HighScoreResourceTest.class.getName());

    private static AppDescriptor toAppDescriptor(String... contexts)
    {
        WebAppDescriptor.Builder builder = new WebAppDescriptor.Builder();

        builder.contextParam("contextConfigLocation", StringUtils.join(contexts, " "));
        builder.servletClass(SpringServlet.class);
        builder.contextListenerClass(ContextLoaderListener.class);
        builder.requestListenerClass(RequestContextListener.class);
        builder.initParam("com.sun.jersey.api.json.POJOMappingFeature", "true");


        ClientConfig clientConfig = new DefaultClientConfig();
        clientConfig.getFeatures().put(JSONConfiguration.FEATURE_POJO_MAPPING, Boolean.TRUE);

        builder.clientConfig(clientConfig);

        return builder.build();
    }

    private List<HighScore> highScores;

    public HighScoreResourceTest() throws Exception
    {
        super(toAppDescriptor("classpath:applicationContext-resource-test.xml"));

        HighScoreDao highScoreDao = mock(HighScoreDao.class);

        highScores = new ArrayList<HighScore>();

        when(highScoreDao.getHighScores()).thenReturn(highScores);
        when(highScoreDao.isHighScore(12345)).thenReturn(true);
        doAnswer(new Answer()
            {
                @Override
                public Object answer(InvocationOnMock invocationOnMock) throws Throwable
                {
                    highScores.add((HighScore) invocationOnMock.getArguments()[0]);

                    return null;
                }
            }).when(highScoreDao).saveHighScore((HighScore) anyObject());

        ProxyFactoryBean proxyFactoryBean = (ProxyFactoryBean) ContextLoaderListener.getCurrentWebApplicationContext().getBean("&highScoreDao");
        proxyFactoryBean.setTarget(highScoreDao);
    }

    @Before
    public void setup()
    {
        highScores.add(new HighScore(null, "a", 1, new Date()));
        highScores.add(new HighScore(null, "b", 2, new Date()));
        highScores.add(new HighScore(null, "c", 3, new Date()));
    }

    @After
    public void teardown()
    {
        highScores.clear();
    }

    @Test
    public void testGetHighScores()
    {
        WebResource webResource = resource();
        List<HighScore> res = webResource.path("/getHighScores").accept(MediaType.APPLICATION_JSON).get(
                new GenericType<List<HighScore>>()
                {
                });

        LOGGER.info("res: " + res);

        assertTrue(highScores.equals(res));
    }

    @Test
    public void testIsHighScore()
    {
        WebResource webResource = resource();
        Boolean res = webResource.path("/isHighScore").queryParam("score", String.valueOf(12345)).accept(
                MediaType.APPLICATION_JSON).get(Boolean.class);
    }

    @Test
    public void testSaveHighScore()
    {
        HighScore highScore = new HighScore(null, "d", 4, new Date());

        WebResource webResource = resource();
        webResource.path("/saveHighScore").type(MediaType.APPLICATION_JSON).post(highScore);

        List<HighScore> res = webResource.path("/getHighScores").accept(MediaType.APPLICATION_JSON).get(
                new GenericType<List<HighScore>>()
                {
                });

        LOGGER.info("res: " + res);

        assertTrue(highScores.contains(highScore));
    }
}
